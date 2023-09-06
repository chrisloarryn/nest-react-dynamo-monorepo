import { Link } from "react-router-dom";
import { TodoList } from "../../components/todo-list";
import { FC } from "react";

type TodoPageProps = {}

export const TodoPage: FC<TodoPageProps> = () => {
	return (
		<div>
			<h1>Todo Page</h1>
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.

			<br />
			<TodoList items={[1, 2, 3]} />
			<Link to="/">Go back to home</Link>
		</div>
	);
};