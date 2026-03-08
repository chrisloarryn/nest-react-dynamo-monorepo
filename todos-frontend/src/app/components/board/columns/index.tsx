import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import AddColumnButton from './buttons/add-column-button';
import CardDetailsModal from './modals/card-details-modal';
import Column from './column';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { fetchBoard } from '../../../slices/board';
import {
  createCardOrderPatches,
  createColumnOrderPatches,
  reorderCards,
  reorderColumns,
} from '../../../util/ordering';
import { addColumnToBoard, fetchColumns, persistColumnOrders, setColumns } from '../../../slices/columns';
import { fetchCards, persistCardOrders, setCards } from '../../../slices/cards';
import { fetchUsers } from '../../../slices/users';
import {
  isCardDragData,
  isColumnBodyDropData,
  isColumnDragData,
} from './dnd-data';

const BoardColumns = () => {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((state) => state.columns.columns);
  const cards = useAppSelector((state) => state.cards.cards);
  const board = useAppSelector((state) => state.board.board);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const columnsRef = useRef(columns);
  const cardsRef = useRef(cards);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    void dispatch(fetchBoard(board.id));
    void dispatch(fetchColumns());
    void dispatch(fetchCards());
  }, [board.id, dispatch]);

  useEffect(() => {
    if (!board.createdBy && board.users.length === 0) {
      return;
    }

    void dispatch(fetchUsers());
  }, [board.createdBy, board.users, dispatch]);

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) =>
        source.data.type === 'card' || source.data.type === 'column',
      onDrop: ({ source, location }) => {
        const dropTargets = location.current.dropTargets;

        if (isColumnDragData(source.data)) {
          const target = dropTargets.find((dropTarget) => isColumnDragData(dropTarget.data));

          if (!target || !isColumnDragData(target.data) || target.data.columnId === source.data.columnId) {
            return;
          }

          const edge = extractClosestEdge(target.data);
          if (edge !== 'left' && edge !== 'right') {
            return;
          }

          const nextColumns = reorderColumns(
            columnsRef.current,
            source.data.columnId,
            target.data.columnId,
            edge
          );

          dispatch(setColumns(nextColumns));
          void dispatch(persistColumnOrders(createColumnOrderPatches(nextColumns)));
          return;
        }

        if (!isCardDragData(source.data)) {
          return;
        }

        const cardTarget = dropTargets.find((dropTarget) => isCardDragData(dropTarget.data));
        const columnBodyTarget = dropTargets.find((dropTarget) =>
          isColumnBodyDropData(dropTarget.data)
        );

        const sourceCard = cardsRef.current.find((card) => card.id === source.data.cardId);
        if (!sourceCard) {
          return;
        }

        const affectedColumns = new Set<string>([sourceCard.columnId]);

        if (cardTarget && isCardDragData(cardTarget.data)) {
          const edge = extractClosestEdge(cardTarget.data);
          if (edge !== 'top' && edge !== 'bottom') {
            return;
          }

          const targetCard = cardsRef.current.find((card) => card.id === cardTarget.data.cardId);
          if (!targetCard) {
            return;
          }

          affectedColumns.add(targetCard.columnId);
          const nextCards = reorderCards(cardsRef.current, source.data.cardId, {
            type: 'card',
            cardId: cardTarget.data.cardId,
            edge,
          });

          dispatch(setCards(nextCards));
          void dispatch(
            persistCardOrders(createCardOrderPatches(nextCards, [...affectedColumns]))
          );
          return;
        }

        if (columnBodyTarget && isColumnBodyDropData(columnBodyTarget.data)) {
          affectedColumns.add(columnBodyTarget.data.columnId);
          const nextCards = reorderCards(cardsRef.current, source.data.cardId, {
            type: 'column',
            columnId: columnBodyTarget.data.columnId,
          });

          dispatch(setCards(nextCards));
          void dispatch(
            persistCardOrders(createCardOrderPatches(nextCards, [...affectedColumns]))
          );
        }
      },
    });
  }, [dispatch]);

  const orderedColumns = [...columns].sort((left, right) => left.order - right.order);
  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  const showCardDetail = (cardId: string) => {
    setSelectedCardId(cardId);
    onOpen();
  };

  const addColumn = async () => {
    await dispatch(addColumnToBoard());
  };

  const cardsForColumn = (columnId: string) =>
    cards
      .filter((card) => card.columnId === columnId)
      .sort((left, right) => left.order - right.order);

  return (
    <Box display="block" position="relative" height="calc(100vh - 90px)" overflowX="auto">
      <Box display="flex" position="absolute" alignItems="flex-start">
        {orderedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={cardsForColumn(column.id)}
            showCardDetail={showCardDetail}
          />
        ))}
        <AddColumnButton addColumn={addColumn} />
      </Box>
      {selectedCard ? (
        <CardDetailsModal
          key={selectedCard.id}
          isOpen={isOpen}
          onClose={() => {
            setSelectedCardId(null);
            onClose();
          }}
          card={selectedCard}
        />
      ) : null}
    </Box>
  );
};

export default BoardColumns;
