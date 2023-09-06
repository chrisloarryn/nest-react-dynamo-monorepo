import React, { useState } from 'react';
import styled from 'styled-components';

const BoardWrapper = styled.div`
  display: flex;
  padding: 10px;
  font-family: Arial, sans-serif;
`;

const List = styled.div`
  width: 300px;
  background-color: #f4f5f7;
  margin-right: 20px;
  padding: 10px;
  border-radius: 5px;
`;

const ListHeader = styled.div`
  font-weight: bold;
`;

const Card = styled.div`
  background-color: #ffffff;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #e1e2e4;
  }
`;

const AddCard = styled.div`
  margin-top: 10px;
  cursor: pointer;
  color: #0079bf;
  &:hover {
    text-decoration: underline;
  }
`;

const initialTrelloStatuses = [
	{
		id: 1,
		name: 'To Do'
	},
	{
		id: 2,
		name: 'Doing'
	},
	{
		id: 3,
		name: 'Done'
	}
]

const initialTasks = [
	{
		id: 1,
		name: 'Pintar cocina',
		type: 'Domestic',
		status: 'Doing'
	}
]

function TrelloBoard() {
	const [trelloTasks, setTrelloTasks] = useState(initialTasks)
	const [trelloStatuses, setTrelloStatuses] = useState(initialTrelloStatuses)


	const renderTasks = (status: string) => {
		return trelloTasks.map((task, index) => {
			if (task.status === status) {
				return (
					<Card key={index + 1}>{task.name}</Card>
				);
			}
		});
	}

	const handleAddTask = (status: string) => {
		const taskName = prompt('Task name');
		console.log('Add task');
		if (taskName) {
			setTrelloTasks([...trelloTasks, {
				id: trelloTasks.length + 1,
				name: taskName,
				type: 'Domestic',
				status: status
			}]);
		}

		console.log(trelloTasks);
	}

	const handleAddBoard = () => {
		const boardName = prompt('Board name');
		console.log('Add board');
		if (boardName) {
			setTrelloStatuses([...trelloStatuses, {
				id: trelloStatuses.length + 1,
				name: boardName
			}]);
		}

		console.log(trelloStatuses);
	}

	const renderStatuses = () => {
		return trelloStatuses.map((status, index) => {
			// each 3rd element should have a <br />
			const shouldHaveBr = (index + 1) % 3 === 0;
			return (
				<>
					<List key={index + 1}>
						<ListHeader>{status.name}</ListHeader>
						{renderTasks(status.name)}
						<AddCard onClick={
							() => handleAddTask(status.name)
						}>+ Add a card</AddCard>
					</List >
					{shouldHaveBr && <br />}
				</>
			);
		});
	}

	return (
		<BoardWrapper>
			{renderStatuses()}
			<AddCard onClick={handleAddBoard}>Add board</AddCard>
		</BoardWrapper>
	);
}

export default TrelloBoard;