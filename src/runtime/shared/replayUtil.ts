export function calcReplayLastTime(tickList: any, fps: number): number {
	const lastAge = tickList[1];
	const ticksWithEvents = tickList[2] || [];
	for (let i = ticksWithEvents.length - 1; i >= 0; --i) {
		const tick = ticksWithEvents[i];
		const pevs = tick[1] || [];
		for (let j = 0; j < pevs.length; ++j) {
			if (pevs[j][0] === 2) // Timestamp
				return (pevs[j][3] /* Timestamp */) + (lastAge - tick[0]) * 1000 / fps;
		}
	}
	return lastAge * 1000 / fps;
}
