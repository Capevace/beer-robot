import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import express from 'express';
import cors from 'cors';
import xmlrpc from 'express-xmlrpc';
import { Server } from 'socket.io';
import * as beer from './beer.mjs';
import * as chess from './chess.mjs';

let activeModule = beer;

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NODE_MODULES_PATH = path.resolve(__dirname, '../node_modules');
const STATIC_PATH = path.resolve(__dirname, '../static');
const CHESS_CLIENT_PATH = path.join(STATIC_PATH, 'chess-client');

let task = {
	_current: null,
	get current() {
		return this._current;
	},
	set current(value) {
		this._current = value ? { ...this._current, ...value } : null;

		broadcast('task', {
			message: `Task changed`,
			task: value ?? null,
		});
	},
};

app.use(cors({ origin: '*' }));

// app.get('/move-robot/:from/:to', (req, res) => {
// 	const from = String(req.params.from);
// 	const to = String(req.params.to);

// 	console.log('Moving', from, to);
// 	movePosition = { from, to };
// });

app.post('/mode/:mode', (req, res) => {
	const mode = String(req.params.mode);

	if (['chess', 'beer'].includes(mode)) {
		broadcast('abort', {
			message: 'Aborting current task',
		});
		activeModule.onRobotFinish &&
			activeModule.onRobotFinish({ broadcast, task, aborted: true });

		broadcast('mode-switch', {
			message: `Switching to mode: ${mode}`,
		});
		switch (mode) {
			case 'beer':
				activeModule = beer;
				break;
			case 'chess':
				activeModule = chess;
				break;
		}
	}

	return res.redirect('/');
});

app.post('/abort', (req, res) => {
	broadcast('abort', {
		message: 'Aborting current task',
	});

	activeModule.onRobotFinish &&
		activeModule.onRobotFinish({ broadcast, task, aborted: true });

	return res.redirect('/');
});

app.post('/rpc2', xmlrpc.bodyParser, (req, res, next) => {
	req.task = task;
	req.broadcast = broadcast;

	xmlrpc.apiHandler({
		...(activeModule.rpc ?? {}),
		shouldRobotStart: (req, res) => {
			const shouldStart = activeModule.shouldRobotStart
				? activeModule.shouldRobotStart({
						broadcast,
						task,
				  })
				: task.current !== null && !task.current.started;

			broadcast('robot-event', {
				proxiedEvent: 'start-check',
				message: shouldStart
					? 'Robot asked and received start signal'
					: 'Asking for starter signal',
			});

			if (shouldStart) {
				task.current.started = true;

				broadcast('task', {
					message: `Task was collected and started`,
					task: task.current,
				});
			}

			res.send(xmlrpc.serializeResponse(shouldStart, req, res));
		},
		onRobotEvent: (req, res) => {
			const eventId = req.body.params[0];
			const unknownEvent = {
				type: String(eventId),
				message: `Unrecognized event: ${String(eventId)}`,
			};
			const event = activeModule.onRobotEvent
				? activeModule.onRobotEvent(
						{ broadcast, task },
						eventId,
						...req.body.params
				  ) ?? unknownEvent
				: unknownEvent;

			broadcast('robot-event', {
				proxiedEvent: event.type,
				message: event.message,
			});

			res.send(xmlrpc.serializeResponse(0, req, res));
		},
		onRobotFinish: (req, res) => {
			broadcast('robot-event', {
				proxiedEvent: 'finish',
				message: 'Robot script finished',
			});

			res.send(
				xmlrpc.serializeResponse(
					activeModule.onRobotFinish
						? activeModule.onRobotFinish({ broadcast, task }) ?? 0
						: 0,
					req,
					res
				)
			);
		},
	})(req, res, next);
});

app.get('/', async (req, res, next) => {
	await activeModule.handleView(req, res, next);
});
app.use('/', express.static(STATIC_PATH));
app.use('/', express.static(CHESS_CLIENT_PATH));

// Possibly unsafe, but quick hack. Don't publish to web like this.
app.use('/node_modules', express.static(NODE_MODULES_PATH));

const server = app.listen(PORT, () => {
	console.log(`leuphana-robot listening on port ${PORT}`);
});

const io = new Server(server);
let sockets = new Map();

activeModule.setup && activeModule.setup({ app, broadcast });

const random = () => Math.floor(Math.random() * 1000000);

io.on('connection', function connection(socket) {
	console.log('client connected');
	const id = random();
	sockets.set(id, socket);

	socket.on('disconnect', () => {
		sockets.delete(id);
	});

	// setInterval(async () => {
	// 	socket.emit('ping');
	// }, 10000);

	socket.emit('task', {
		message: 'Initial task',
		task: task.current,
	});

	activeModule.onSocketConnect({
		task,
		socket: {
			id,
			on(event, callback) {
				socket.on(event, callback);
			},
			emit(event, data = {}) {
				socket.emit(event, data);
			},
			broadcast,
		},
	});
});

function broadcast(event, data = {}) {
	const dataWithoutMessage = { ...data, message: undefined };

	console.log(
		`EVENT: ${event} ${
			data.message ? `– ${data.message} ` : ''
		}– ${JSON.stringify(dataWithoutMessage)}`
	);

	io.emit(event, data);
}
