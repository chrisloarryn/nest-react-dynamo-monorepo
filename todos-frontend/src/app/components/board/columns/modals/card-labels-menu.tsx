import {
  Box,
  Button,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { MdLabelOutline } from 'react-icons/md';
import { useAppDispatch } from '../../../../hooks';
import { updateCard } from '../../../../slices/cards';
import type { Label } from '../../../../types/cards';

type Props = {
  id: string;
};

const cardLabels: Label[] = [
  {
    type: 'performance',
    bg: '#0079bf',
  },
  {
    type: 'bug',
    bg: '#eb5a46',
  },
  {
    type: 'feature',
    bg: '#61bd4f',
  },
  {
    type: 'information',
    bg: '#ff9f1a',
  },
  {
    type: 'warning',
    bg: '#f2d600',
  },
];

const CardLabel = ({ id }: Props) => {
  const dispatch = useAppDispatch();

  const handleClick = async (label: Label) => {
    await dispatch(
      updateCard({
        id,
        label,
      })
    );
  };

  return (
    <Box marginTop="2rem" flexDirection="column" width="full">
      <Text as="samp" whiteSpace="nowrap">
        ADD TO CARD
      </Text>
      <List spacing={3} p="5px">
        <ListItem>
          <Menu>
            <MenuButton leftIcon={<MdLabelOutline />} size="xs" whiteSpace="nowrap" as={Button}>
              Labels
            </MenuButton>
            <MenuList padding="5px">
              {cardLabels.map((label) => (
                <MenuItem
                  bg={label.bg}
                  marginBottom="5px"
                  key={label.type}
                  onClick={() => handleClick(label)}
                >
                  <Box minH="20px" />
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </ListItem>
      </List>
    </Box>
  );
};

export default CardLabel;
