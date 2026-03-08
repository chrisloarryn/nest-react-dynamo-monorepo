import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { AiOutlineClose, AiOutlineDelete, AiOutlineDown, AiOutlineLaptop } from 'react-icons/ai';
import { GrTextAlignFull } from 'react-icons/gr';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { deleteCard, updateCard } from '../../../../slices/cards';
import type { CardDetail } from '../../../../types/cards';
import QuillEditor from '../../../../components/quill-editor';
import CardLabel from './card-labels-menu';

type Props = {
  onClose: () => void;
  isOpen: boolean;
  card: CardDetail;
};

const CardDetailsModal = ({ onClose, isOpen, card }: Props) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.text);
  const [assigned, setAssigned] = useState(card.assignedTo ?? '');
  const cardRequest = useAppSelector((state) => state.cards.isRequesting);
  const cardDelete = useAppSelector((state) => state.cards.isDeleting);
  const users = useAppSelector((state) => state.users.users);

  const handleCardDelete = async () => {
    await dispatch(deleteCard(card.id));
    onClose();
  };

  const handleModalClose = async () => {
    await dispatch(
      updateCard({
        id: card.id,
        title,
        text: description,
        columnId: card.columnId,
        assignedTo: assigned,
      })
    );

    onClose();
  };

  const handleAssign = async (userId: string) => {
    setAssigned(userId);

    await dispatch(
      updateCard({
        id: card.id,
        assignedTo: userId,
      })
    );
  };

  return (
    <Modal size="xl" onClose={handleModalClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent maxW="64rem">
        <ModalBody>
          {card.label ? (
            <Badge bg={card.label.bg} color="white">
              {card.label.type}
            </Badge>
          ) : null}
          <Box display="flex" marginTop="1rem">
            <AiOutlineLaptop />
            <Input
              name="title"
              size="sm"
              marginLeft="1rem"
              value={title}
              fontWeight="bold"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Card title"
            />
          </Box>
          <Box display="flex" gap="6">
            <Box width="100%" marginTop="2rem">
              <Box display="flex" fontWeight="bold">
                <GrTextAlignFull />
                <Text marginLeft="1rem">Description</Text>
              </Box>
              <Box marginLeft="1.5rem" minHeight="200px" width="90%">
                <QuillEditor value={description} onChange={setDescription} />
              </Box>
            </Box>
            <Box display="flex" flexDirection="column">
              <CardLabel id={card.id} />
              <Menu>
                <MenuButton as={Button} size="xs" rightIcon={<AiOutlineDown />}>
                  Assign To
                </MenuButton>
                <MenuList>
                  {users.map((user) => (
                    <MenuItem key={user.id} onClick={() => handleAssign(user.id)}>
                      {user.fullName}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={() => handleAssign('')}>Unassign</MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            size="xs"
            marginRight="1rem"
            onClick={handleCardDelete}
            isDisabled={cardDelete}
            isLoading={cardDelete}
            loadingText="Deleting"
            bg="red.500"
            color="white"
            _hover={{
              backgroundColor: 'red.600',
            }}
          >
            <AiOutlineDelete />
          </Button>
          <Button
            size="xs"
            onClick={handleModalClose}
            isDisabled={cardRequest}
            isLoading={cardRequest}
            loadingText="Updating"
          >
            <AiOutlineClose /> Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CardDetailsModal;
