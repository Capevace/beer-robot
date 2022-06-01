import {
	setLogContainer,
	emit,
	on,
	logEvent
} from 'http://localhost:3000/api.mjs';

const ui = {
	container: document.createElement('div'),
	logContainer: document.createElement('table'),
	resetButton: document.querySelector('#reset-button'),
	controlHeading: document.createElement('h2'),
	sendButton: document.createElement('button'),
	autoInputLabel: document.createElement('label'),
	autoInput: document.createElement('input'),
	moves: document.createElement('table'),
	movesBody: document.createElement('tbody'),
};

setLogContainer(ui.logContainer);

ui.controlHeading.className = "font-bold text-xl mt-5 mb-3 pb-2 border-b border-gray-300";
ui.controlHeading.textContent = 'Roboter-Steuerung';

ui.moves.className = 'w-full';

ui.sendButton.className = 'btn btn-dark mt-3';
ui.sendButton.textContent = 'An den Roboter senden';
ui.sendButton.disabled = true;
ui.sendButton.addEventListener('click', async (e) => {
	e.preventDefault();

	if (movesToSend.length > 0) {
		const move = movesToSend.shift();
		renderMoves();

		await reportMove(move);
	}
});

ui.autoInputLabel.textContent = 'Roboter bewegt auch Mensch';
ui.autoInputLabel.for = 'auto-mode-input';

ui.autoInput.type = 'checkbox';
ui.autoInput.name = 'auto-mode-input';
ui.autoInput.id = 'auto-mode-input';
ui.autoInput.className = 'mr-2';
ui.autoInput.addEventListener('change', (e) => {
	window.localStorage.setItem('auto-mode', ui.autoInput.checked);
});
ui.autoInput.checked =
	window.localStorage.getItem('auto-mode') === 'true' ?? false;

ui.autoInputLabel.prepend(ui.autoInput);

ui.logContainer.className = 'my-5';

ui.container.append(ui.controlHeading);
ui.container.append(ui.autoInputLabel);
ui.container.append(ui.moves);
ui.container.append(ui.sendButton);
ui.container.append(ui.logContainer);

const thead = document.createElement('thead');
thead.innerHTML = `
	<th>Entfernen</th>
	<th>Von</th>
	<th>Nach</th>
`;
ui.moves.append(thead);
ui.moves.append(ui.movesBody);

let task = null;
on('task', ({ task: _task }) => {
	task = _task;

	ui.sendButton.textContent = !task
		? 'An den Roboter senden'
		: 'Zug wird ausgeführt...';
	ui.sendButton.disabled = movesToSend.length === 0 ? true : !!task;

	renderMoves();
});

on('*', (data) => {
	if (data.event === 'robot-event') {
		logEvent(data.proxiedEvent, data.message, {
			prefix: 'robot',
			level: 1,
		});
	} else {
		logEvent(data.event, data.message, { prefix: 'server', level: 0 });
	}
});

let movesToSend = [];
function onMove(from, to, remove = null) {
	movesToSend.push({ from, to, remove });
	ui.sendButton.disabled = !!task;

	renderMoves();
}

function renderMoves() {
	ui.movesBody.innerHTML = '';

	const createRow = (move) => {
		const row = document.createElement('tr');
		const remove = document.createElement('td');
		remove.textContent = move.remove ?? '–';

		const from = document.createElement('td');
		from.textContent = move.from;

		const to = document.createElement('td');
		to.textContent = move.to;

		row.append(remove);
		row.append(from);
		row.append(to);

		return row;
	};

	if (task) {
		const taskRow = createRow(task.move);
		taskRow.classList.add('bg-green-200');
		taskRow.classList.add('font-bold');

		ui.movesBody.append(taskRow);
	}

	movesToSend.forEach((move, index) => {
		const row = createRow(move);

		if (index === 0) {
			row.classList.add('bg-gray-200')
		}

		row.addEventListener('click', (e) => {
			if (confirm('Zug wirklich entfernen?')) {
				movesToSend.splice(index, 1);
				renderMoves();
			}
		});

		ui.movesBody.append(row);
	});
}

async function reportMove(move) {
	ui.sendButton.textContent = 'Zug wird ausgeführt...';
	ui.sendButton.disabled = true;

	emit('chess:move', { move });
}

export default function init(chessConsole) {
	const robotColor = 'b';

	chessConsole.state.observeChess(({ functionName, returnValue }) => {
		console.log(functionName, returnValue);
		if (functionName === 'move' && returnValue) {
			if (ui.autoInput.checked || returnValue.color === robotColor) {
				onMove(
					returnValue.from,
					returnValue.to,
					returnValue.captured ? returnValue.to : null
				);
			}
		}
	});

	return ui.container;
}
