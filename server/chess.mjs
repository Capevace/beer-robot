import xmlrpc from 'express-xmlrpc';

// {
// 	remove: 'b7',
// 	move: { from: 'a7', to: 'b7' },
// }
export const name = 'chess';

export function setup({ app, broadcast }) {}

export function onSocketConnect({ socket, task }) {
	socket.on('chess:move', async (data) => {
		moveChessPieces({ socket, task }, data);
	});
}

export const rpc = {
	removeAtField: (req, res) => {
		req.broadcast('removeAtField', {
			message: 'Feld zum Entfernen wurde angefragt',
		});

		res.send(
			xmlrpc.serializeResponse(
				req.task.current ? req.task.current.move.remove ?? 0 : 0,
				req,
				res
			)
		);
	},
	fromField: (req, res) => {
		req.broadcast('fromField', {
			message: 'Start-Feld wurde angefragt',
		});

		res.send(
			xmlrpc.serializeResponse(
				req.task.current ? req.task.current.move.from : 0,
				req,
				res
			)
		);
	},
	toField: (req, res) => {
		req.broadcast('toField', {
			message: 'Ziel-Feld wurde angefragt',
		});

		res.send(
			xmlrpc.serializeResponse(
				req.task.current ? req.task.current.move.to : 0,
				req,
				res
			)
		);
	},
};

export function onRobotEvent({ broadcast, task }, eventId, ...args) {
	switch (eventId) {
		case 0:
			return {
				type: 'error',
				message: 'Pinging the server',
			};
		case 1:
			return {
				type: 'remove-piece-received',
				message:
					Number(args[0]) === -1
						? 'Es wird keine Figur entfernt'
						: `Figur wird entfernt: ${args[0]}`,
			};
		case 2:
			return {
				type: 'from-received',
				message: `Aktuelle Figur-Position: ${args[0] ?? '–'}`,
			};

		case 3:
			return {
				type: 'to-received',
				message: `Figur-Ziel: ${args[0] ?? '–'}`,
			};

		case 4:
			return {
				type: 'move-to-field',
				message: `Bewege zu Feld: ${args[0] ?? '–'}`,
			};

		case 5:
			return {
				type: 'pickup-piece',
				message: `Figur wird angehoben: ${args[0] ?? '–'}`,
			};

		case 6:
			return {
				type: 'move-to-captured',
				message: `Bewege zur Figur-Ablage`,
			};

		case 7:
			return {
				type: 'drop-piece',
				message: `Figur wird fallengelassen`,
			};

		case 8:
			return {
				type: 'place-piece',
				message: `Figur wird abgestellt: ${args[0] ?? '–'}`,
			};

		case 9:
			return {
				type: 'move-home',
				message: `Roboter fährt in die Bereitschaftsposition`,
			};

		case 10:
			return {
				type: 'move-to-clock',
				message: `Zur Schachuhr bewegen`,
			};

		case 11:
			return {
				type: 'press-clock',
				message: `Schachuhr betätigen`,
			};
	}
}

export function onRobotFinish({ broadcast, task }) {
	if (!task.current) {
		return null;
	}

	task.current = null;

	broadcast('task', {
		message: `Schachzug komplett`,
		task: null,
	});
}

export function moveChessPieces({ socket, task }, data) {
	if (task.current) {
		return socket.emit('error', {
			message: 'Already moving pieces, slow down!',
		});
	}

	console.log('Starting move sequence');
	socket.broadcast('chess:move', { message: 'Starting move sequence' });

	task.current = {
		move: {
			remove: data.move.remove,
			from: data.move.from,
			to: data.move.to,
		},
		started: false,
	};

	const removingMessage = task.current.move.remove
		? `Remove piece at ${task.current.move.remove}.`
		: '';
	const movingMessage = `Move piece from ${task.current.move.from} to ${task.current.move.to}.`;

	socket.broadcast('task', {
		message: `NEW: ${removingMessage} ${movingMessage}`,
		task: task.current,
	});
}
