import React, { FC } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Box } from '@chakra-ui/react';
//https://github.com/zenoamaro/react-quill/issues/122
import ReactQuill from 'react-quill';

const QuillEditor: FC = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean']
    ]
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
    'image'
  ];

  return (
    <Box className="text-editor">
      <ReactQuill
        theme="snow"
        style={{ height: '120px' }}
        value={value}
        onChange={(value) => onChange(value)}
        modules={modules}
        formats={formats}></ReactQuill>
    </Box>
  );
};

export default QuillEditor;
