import React, { FC, useEffect } from 'react';
import { Box, Badge, Avatar } from '@chakra-ui/react';
import { Draggable } from 'react-beautiful-dnd';
import { CardDetail } from '../../../types/cards';
import { useAppSelector } from '../../../hooks';

type Props = {
  showCardDetail: (cardId: string) => void;
  cardIndex: number;
  card: CardDetail;
};

const Card: FC<Props> = ({ cardIndex, showCardDetail, card }) => {
  const users = useAppSelector((state) => state.users.users);

  const loadAssignedToUser = () => {
    if (!card.assignedTo) return;

    const user = users.filter((user) => user.id === card.assignedTo);

    return (
      <Box display="flex" justifyContent="flex-end">
        <Avatar size="xs" name={user[0]?.fullName} />
      </Box>
    );
  };

  useEffect(() => {
    console.log('card', JSON.stringify(card, null, 2));
  }, [card]);

  return (
    // https://github.com/atlassian/react-beautiful-dnd/issues/1767
    <Draggable draggableId={card.id} index={cardIndex} key={card.id}>
      {(provided) => (
        <Box
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          m="5px"
          p="10px"
          id={card.id}
          minHeight="80px"
          borderWidth="1px"
          bg="white"
          cursor="pointer"
          borderRadius="md"
          overflow="auto"
          _hover={{
            backgroundColor: 'lightblue'
          }}
          onClick={() => showCardDetail(card.id)}>
          {card.label && (
            <Badge bg={card.label.type} color="white">
              {card.label.type}
            </Badge>
          )}
          <p>{card.title}</p>
          {loadAssignedToUser()}
        </Box>
      )}
    </Draggable>
  );
};

export default Card;
