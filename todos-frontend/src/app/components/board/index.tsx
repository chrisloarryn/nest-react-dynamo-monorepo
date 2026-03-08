import { Box } from '@chakra-ui/react';
import { useAppSelector } from '../../hooks';
import BoardColumns from './columns';

const Board = () => {
  const board = useAppSelector((state) => state.board.board);

  return (
    <Box
      background={
        board.backgroundImage
          ? `linear-gradient(rgba(14, 18, 24, 0.15), rgba(14, 18, 24, 0.25)), url('${board.backgroundImage}')`
          : 'linear-gradient(135deg, #dbeafe 0%, #f8fafc 50%, #cffafe 100%)'
      }
      backgroundPosition="center"
      h="100vh"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      p="4"
    >
      <BoardColumns />
    </Box>
  );
};

export default Board;
