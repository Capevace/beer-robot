let logContainer = document.createElement('table');

export const socket = io();

socket.on('connect', () => {
	logEvent('connected', 'Connection established', {
		prefix: 'client',
		level: 0,
	});
});

socket.on('disconnect', () => {
	logEvent('disconnected', 'Connection lost', { prefix: 'client', level: 0 });
});

export function emit(event, data = {}) {
	socket.emit(event, data);
}

export function on(event, callback) {
	if (event === '*') {
		socket.onAny((event, data) => callback({ ...data, event }));
	} else {
		socket.on(event, callback);
	}
	// socket.addEventListener('message', (message) => {
	// 	try {
	// 		const json = JSON.parse(message.data);

	// 		if (json) {
	// 			if (json.event === event) {
	// 				callback(json.data ?? {});
	// 			} else if (event === '*') {
	// 				callback({ ...(json.data ?? {}), event: json.event });
	// 			}
	// 		}
	// 	} catch (e) {
	// 		console.error('error in websocket', message, e);
	// 	}
	// });
}

export function setLogContainer(_logContainer) {
	logContainer = _logContainer;

	const resetButton = document.querySelector('#reset-button');
	
	if (resetButton) { 
		resetButton.addEventListener('click', async e => {
			e.preventDefault();

			await abort();
		});
	}
}

export function logEvent(
	event,
	message = '–',
	options = { prefix: '', level: 0 }
) {
	const row = document.createElement('div');
	row.className = 'text-sm ';
	// row.classList.add('flex');

	const prefixSpan = document.createElement('td');
	prefixSpan.className = 'pr-1 align-top';

	if (options.prefix === 'robot') {
		prefixSpan.classList.add('text-blue-700');
	}
	if (options.prefix === 'client') {
		prefixSpan.classList.add('text-purple-700');
	}
	if (options.prefix === 'beer') {
		prefixSpan.classList.add('text-yellow-700');
	} else {
		prefixSpan.classList.add('text-teal-700');
	}
	prefixSpan.textContent = options.prefix;

	const eventSpan = document.createElement('td');
	eventSpan.className = 'font-medium px-1 align-top';
	eventSpan.textContent = event;

	const messageSpan = document.createElement('td');
	messageSpan.className = 'text-xs pl-1 align-middle';
	messageSpan.textContent = `${message}`;

	row.appendChild(prefixSpan);
	row.appendChild(eventSpan);
	row.appendChild(messageSpan);

	if (event === 'error' || event === 'disconnected') {
		row.classList.add('text-error-700');
	} else if (options.level > 0) {
		row.classList.add('font-bold');
	} else {
		row.classList.add('text-gray-700');
	}

	logContainer.insertBefore(row, logContainer.children[0]);
}

export function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function abort() {
	return fetch('/abort', { method: 'post' });
}
