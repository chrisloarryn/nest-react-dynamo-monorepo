import { Box } from '@chakra-ui/react';
import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const QuillEditor = ({ value, onChange }: Props) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
  ];

  return (
    <Box className="text-editor">
      <ReactQuill
        theme="snow"
        style={{ height: '120px' }}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
      />
    </Box>
  );
};

export default QuillEditor;
