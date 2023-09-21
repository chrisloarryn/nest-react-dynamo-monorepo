import React from 'react'
import TrelloBoard from '../board'

interface TodoListProps<T = any> {
	items?: T[]
}

export const TodoList: React.FC<TodoListProps<unknown>> = ({ items = [] }) => {
	return (
		<>
			<TrelloBoard />
		</>
	)
}
