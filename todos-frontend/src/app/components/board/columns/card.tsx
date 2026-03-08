import { useEffect, useRef, useState } from 'react';
import { Avatar, Badge, Box } from '@chakra-ui/react';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type { CardDetail } from '../../../types/cards';
import { useAppSelector } from '../../../hooks';
import { isCardDragData } from './dnd-data';

type Props = {
  card: CardDetail;
  showCardDetail: (cardId: string) => void;
};

const Card = ({ showCardDetail, card }: Props) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const users = useAppSelector((state) => state.users.users);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: 'card',
          cardId: card.id,
          columnId: card.columnId,
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) =>
          isCardDragData(source.data) &&
          source.data.cardId !== card.id,
        getData: ({ input, element: currentElement }) =>
          attachClosestEdge(
            {
              type: 'card',
              cardId: card.id,
              columnId: card.columnId,
            },
            {
              input,
              element: currentElement,
              allowedEdges: ['top', 'bottom'],
            }
          ),
      })
    );
  }, [card.columnId, card.id]);

  const assignedUser = users.find((user) => user.id === card.assignedTo);

  return (
    <Box
      ref={elementRef}
      m="5px"
      p="10px"
      minHeight="80px"
      borderWidth="1px"
      bg={isDragging ? 'gray.100' : 'white'}
      cursor="grab"
      borderRadius="md"
      overflow="auto"
      boxShadow={isDragging ? 'md' : 'sm'}
      _hover={{
        backgroundColor: 'gray.50',
      }}
      onClick={() => showCardDetail(card.id)}
    >
      {card.label ? (
        <Badge bg={card.label.bg} color="white">
          {card.label.type}
        </Badge>
      ) : null}
      <Box mt="2" fontWeight="semibold">
        {card.title}
      </Box>
      {assignedUser ? (
        <Box display="flex" justifyContent="flex-end" mt="3">
          <Avatar size="xs" name={assignedUser.fullName} />
        </Box>
      ) : null}
    </Box>
  );
};

export default Card;
