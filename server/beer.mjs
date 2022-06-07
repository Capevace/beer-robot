import xmlrpc from 'express-xmlrpc';
import fs from 'fs/promises';
import path from 'path';
import { getDirname } from './helpers.mjs';

const __dirname = getDirname(import.meta.url);

let beerSlotState = [1, 1, 1];

export const name = 'beer';

export function setup({ app, broadcast }) {
	// setInterval(async () => {
	// 	const newBeerSlotState = await askForAvailableBeerSlots();
	// 	const stateUpdated =
	// 		newBeerSlotState.length !== beerSlotState.length ||
	// 		newBeerSlotState.reduce((isUpdated, value, index) => {
	// 			if (isUpdated) return isUpdated;
	// 			return beerSlotState[index] !== value;
	// 		}, false);
	// 	if (stateUpdated) {
	// 		broadcast('beer:slots', {
	// 			slots: beerSlotState,
	// 		});
	// 		beerSlotState = [...newBeerSlotState];
	// 	}
	// }, 1000);
}

export async function handleView({ req, res, next }) {
	const contents = await fs.readFile(
		path.resolve(__dirname, '../static/beer.html'),
		'utf8'
	);

	res.send(
		contents.replace(
			':tailwind',
			true
				? `<link rel="stylesheet" href="/assets/style.css" />`
				: `<script src="https://cdn.tailwindcss.com"></script>`
		)
	);
}

export function onSocketConnect({ socket, task }) {
	socket.emit('beer:slots', {
		slots: beerSlotState,
	});

	socket.on('beer:start', async (data) => {
		await runBeer({ socket, task });
	});

	socket.on('beer:slot-sequence', async (data) => {
		if (
			!Array.isArray(data.slots) ||
			data.slots.filter((slot) => parseInt(slot) > 1).length > 0
		) {
			return socket.broadcast('error', {
				message: `Slot-sequence is invalid: ${JSON.stringify(
					data.slots
				)}`,
			});
		}

		beerSlotState = data.slots;

		socket.broadcast('beer:slots', {
			slots: beerSlotState,
		});
	});
}

export const rpc = {
	availableBeerSlot: (req, res) => {
		req.broadcast('availableBeerSlot', {
			message: 'Beer slot was requested',
		});

		res.send(
			xmlrpc.serializeResponse(
				req.task.current ? req.task.current.slot : -1,
				req,
				res
			)
		);
	},
};

export function onRobotEvent({ broadcast }, eventId, ...args) {
	switch (eventId) {
		case 0:
			return {
				type: 'slot-received',
				message: `Bier-Nummer erhalten: ${args[0] ?? '–'}`,
			};
		case 1:
			return {
				type: 'moving-to-slot',
				message: `Fährt zu Bier: ${args[0] ?? '–'}`,
			};

		case 2:
			return {
				type: 'grabbing-beer',
				message: `Bier wird genommen: ${args[0] ?? '–'}`,
			};

		case 3:
			return {
				type: 'move-swap-point',
				message: `Zum Umgreifpunkt bewegen`,
			};

		case 4:
			return {
				type: 'drop-vertical',
				message: `Bier zum Umgreifen abstellen`,
			};

		case 5:
			return {
				type: 'change-hold',
				message: `Umgreifen`,
			};

		case 6:
			return {
				type: 'pick-up-beer',
				message: `Bier anheben`,
			};

		case 7:
			return {
				type: 'move-to-opener',
				message: `Zum Flaschenöffner bewegen`,
			};

		case 8:
			return {
				type: 'align-opener',
				message: `An den Flaschenöffner ansetzen`,
			};

		case 9:
			return {
				type: 'open-bottle',
				message: `Bierflasche öffnen`,
			};

		case 10:
			return {
				type: 'move-away-from-opener',
				message: `Vom Flaschenöffner entfernen`,
			};

		case 11:
			return {
				type: 'move-to-drop',
				message: `Zum Abstellpunkt bewegen`,
			};

		case 12:
			return {
				type: 'drop-horizontal',
				message: `Bier abstellen`,
			};

		case 13:
			return {
				type: 'move-home',
				message: `Roboter in den Ruhezustand`,
			};
	}
}

export function onRobotFinish({ broadcast, task }) {
	if (!task.current) {
		return null;
	}

	task.current = null;

	broadcast('task', {
		message: `Aktion wurde abgeschlossen.`,
		task: null,
	});
}

async function askForAvailableBeerSlots() {
	return [1, 0, 1, 0, 1, 1];
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function runBeer({ socket, task }) {
	if (task.current) {
		return socket.emit('error', { message: 'Already getting beer' });
	}

	console.log('Starting beer sequence');
	socket.broadcast('start', { message: 'Starting beer sequence' });

	const selectedBeerSlot = beerSlotState.findIndex((value) => value === 1);

	if (selectedBeerSlot === -1) {
		return socket.broadcast('error', {
			message: `No beer available (${selectedBeerSlot})`,
		});
	}

	task.current = {
		started: false,
		slot: selectedBeerSlot,
	};

	socket.broadcast('task', {
		message: `NEW: Get beer from slot ${selectedBeerSlot}`,
		task: task.current,
	});
}
