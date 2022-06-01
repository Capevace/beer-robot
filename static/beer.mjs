import {
	setLogContainer,
	emit,
	on,
	logEvent,
} from 'http://localhost:3000/api.mjs';

const ui = {
	startButton: document.querySelector('#open-beer'),
	logContainer: document.querySelector('#log-container'),
	beerCounter: document.querySelector('#beer-count'),
	taskLabel: document.querySelector('#task'),
	startedLabel: document.querySelector('#started'),
	resetButton: document.querySelector('#reset-button'),
};
setLogContainer(ui.logContainer);

ui.startButton.addEventListener('click', openBeer);
ui.beerCounter.addEventListener('click', () => {
	let slotSequence = prompt(
		'Gebe jetzt die neue Sequenz ein (z.B. "1, 0, 1, 0, 1, 0")'
	)
		.replace(/ /g, '')
		.split(',')
		.map((text) => parseInt(text));

	emit('beer:slot-sequence', {
		slots: slotSequence,
	});
});

on('robot-finish', () => {
	ui.startButton.disabled = false;
});

on('beer:slots', ({ slots }) => {
	ui.beerCounter.textContent = slots.filter((slot) => slot === 1).length;
	logEvent('slots', `Available Slots: ${JSON.stringify(slots)}`, {
		prefix: 'beer',
		level: 0,
	});
});

on('task', ({ task }) => {
	if (task) {
		ui.taskLabel.classList.remove('text-gray-600');
		ui.taskLabel.classList.add('font-bold');
		ui.startButton.disabled = true;
	} else {
		ui.taskLabel.classList.add('text-gray-600');
		ui.taskLabel.classList.remove('font-bold');
		ui.startButton.disabled = false;
	}

	ui.taskLabel.textContent = task
		? `Hole Bier aus Fach ${task.slot}`
		: `keine`;

	ui.startedLabel.textContent = task ? `Gestartet` : `Noch nicht gestartet`;
});

on('*', (data) => {
	if (data.event === 'beer:slots') {
		return;
	} else if (data.event === 'robot-event') {
		logEvent(data.proxiedEvent, data.message, {
			prefix: 'robot',
			level: 1,
		});
	} else {
		logEvent(data.event, data.message, { prefix: 'server', level: 0 });
	}
});

async function openBeer() {
	ui.startButton.disabled = true;

	// FETCH
	emit('beer:start');
}
