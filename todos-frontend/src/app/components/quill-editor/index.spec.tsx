import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuillEditor from './index';

vi.mock('react-quill-new', () => ({
  default: ({
    value,
    onChange,
    modules,
    formats,
  }: {
    value: string;
    onChange: (value: string) => void;
    modules: unknown;
    formats: string[];
  }) => (
    <div data-testid="react-quill" data-formats={formats.join(',')}>
      <textarea
        aria-label="quill-input"
        defaultValue={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div data-testid="quill-modules">{JSON.stringify(modules)}</div>
    </div>
  ),
}));

describe('QuillEditor', () => {
  it('renders the editor and forwards changes', () => {
    const onChange = vi.fn();

    render(<QuillEditor value="Initial value" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('quill-input'), {
      target: { value: 'Updated description' },
    });

    expect(onChange).toHaveBeenCalledWith('Updated description');
    expect(screen.getByTestId('react-quill').getAttribute('data-formats')).toBe(
      'header,bold,italic,underline,strike,blockquote,list,bullet,indent,link,image'
    );
    expect(screen.getByTestId('quill-modules').textContent).toContain('toolbar');
  });
});
