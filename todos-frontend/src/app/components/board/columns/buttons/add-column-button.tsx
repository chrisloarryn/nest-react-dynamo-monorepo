import { Box, Button } from '@chakra-ui/react';
import { useAppSelector } from '../../../../hooks';

type Props = {
  addColumn: () => void;
};

const AddColumnButton = ({ addColumn }: Props) => {
  const columnRequest = useAppSelector((state) => state.columns.isRequesting);

  return (
    <Box
      rounded="lg"
      width="272px"
      display="flex"
      flexDirection="column"
      mt="10px"
      mx="10px"
    >
      <Button
        size="sm"
        my="10px"
        mx="5px"
        bg="whiteAlpha.800"
        color="gray.800"
        onClick={addColumn}
        isLoading={columnRequest}
        isDisabled={columnRequest}
        loadingText="Adding column"
      >
        + Add a column
      </Button>
    </Box>
  );
};

export default AddColumnButton;
