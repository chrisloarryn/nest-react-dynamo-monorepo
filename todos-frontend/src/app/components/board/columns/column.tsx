import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { FiMoreHorizontal } from 'react-icons/fi';
import { GrDrag } from 'react-icons/gr';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { CardDetail } from '../../../types/cards';
import type { Column as ColumnType } from '../../../types/columns';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { addCard } from '../../../slices/cards';
import { deleteColumn, updateColumn } from '../../../slices/columns';
import Cards from './cards';
import { isCardDragData, isColumnDragData } from './dnd-data';

type Props = {
  showCardDetail: (cardId: string) => void;
  column: ColumnType;
  cards: CardDetail[];
};

const Column = ({ showCardDetail, column, cards }: Props) => {
  const dispatch = useAppDispatch();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const cardsAreaRef = useRef<HTMLDivElement | null>(null);
  const [showEditBox, setEditBoxVisibility] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [isDragging, setIsDragging] = useState(false);
  const [isCardDropTarget, setIsCardDropTarget] = useState(false);
  const cardRequest = useAppSelector((state) => state.cards.isRequesting);
  const hasMounted = useRef(false);

  useEffect(() => {
    const rootElement = rootRef.current;
    const dragHandle = dragHandleRef.current;
    const cardsArea = cardsAreaRef.current;

    if (!rootElement || !cardsArea) {
      return;
    }

    return combine(
      draggable({
        element: rootElement,
        dragHandle: dragHandle ?? undefined,
        getInitialData: () => ({
          type: 'column',
          columnId: column.id,
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: rootElement,
        canDrop: ({ source }) =>
          isColumnDragData(source.data) && source.data.columnId !== column.id,
        getData: ({ input, element }) =>
          attachClosestEdge(
            {
              type: 'column',
              columnId: column.id,
            },
            {
              input,
              element,
              allowedEdges: ['left', 'right'],
            }
          ),
      }),
      dropTargetForElements({
        element: cardsArea,
        canDrop: ({ source }) => isCardDragData(source.data),
        getData: () => ({
          type: 'column-body',
          columnId: column.id,
        }),
        onDragEnter: () => setIsCardDropTarget(true),
        onDragLeave: () => setIsCardDropTarget(false),
        onDrop: () => setIsCardDropTarget(false),
      })
    );
  }, [column.id]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (columnName === column.name) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void dispatch(
        updateColumn({
          id: column.id,
          name: columnName,
        })
      );
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [column.id, column.name, columnName, dispatch]);

  const handleCardAdd = async () => {
    await dispatch(addCard(column.id));
  };

  const handleColumnDelete = async () => {
    await dispatch(deleteColumn(column.id));
  };

  return (
    <Box
      ref={rootRef}
      width="272px"
      minWidth="272px"
      maxHeight="calc(100vh - 160px)"
      overflowY="auto"
      mt="10px"
      mx="10px"
      bg={isDragging ? 'whiteAlpha.900' : 'gray.100'}
      borderRadius="lg"
      boxShadow={isDragging ? 'lg' : 'sm'}
      borderWidth="1px"
      borderColor={isCardDropTarget ? 'blue.300' : 'transparent'}
    >
      <Box pb="5px" rounded="lg">
        <Box display="flex" alignItems="center" justifyContent="space-between" p="3">
          {showEditBox ? (
            <Input
              bg="white"
              value={columnName}
              size="sm"
              onChange={(event) => setColumnName(event.target.value)}
              onBlur={() => setEditBoxVisibility(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  setEditBoxVisibility(false);
                }
              }}
            />
          ) : (
            <Heading as="h3" size="sm" display="flex" gap="2" alignItems="center">
              <Box ref={dragHandleRef} display="flex" alignItems="center" gap="2" cursor="grab">
                <GrDrag />
                <Text>{columnName}</Text>
              </Box>
            </Heading>
          )}
          <Menu>
            <MenuButton aria-label="Column options">
              <FiMoreHorizontal />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setEditBoxVisibility((value) => !value)}>
                <AiOutlineEdit />
                <Text marginLeft="5px">Edit</Text>
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleColumnDelete}>
                <AiOutlineDelete />
                <Text marginLeft="5px">Delete</Text>
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <Box ref={cardsAreaRef} minHeight="80px" px="2" py="1">
          <Cards showCardDetail={showCardDetail} cards={cards} />
        </Box>
        <Button
          size="sm"
          my="3"
          mx="auto"
          width="calc(100% - 24px)"
          color="gray.700"
          variant="ghost"
          isDisabled={cardRequest}
          isLoading={cardRequest}
          loadingText="Adding card"
          onClick={handleCardAdd}
        >
          + Add a card
        </Button>
      </Box>
    </Box>
  );
};

export default Column;
