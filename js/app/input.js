/**
 * Binds input handlers for mouse, touch, and keyboard interactions
 * @param {Object} params - Input configuration
 * @param {Object} params.mainStage - Main canvas stage
 * @param {Object} params.selectorApi - State selector API
 * @param {Object} params.loop - Main loop API
 * @param {Object} params.shellSystem - Shell system API
 */
export function bindInput({
	mainStage,
	selectorApi,
	loop,
	shellSystem,
	ui,
	actions,
}) {
	let isUpdatingSpeed = false;

	mainStage.addEventListener("pointerstart", (event) => {
		ui.hideTapHint();
		const btnSize = 50;

		if (event.y < btnSize) {
			if (event.x < btnSize) {
				actions.togglePause();
				return;
			}
			if (event.x > mainStage.width / 2 - btnSize / 2 && event.x < mainStage.width / 2 + btnSize / 2) {
				actions.toggleSound();
				return;
			}
			if (event.x > mainStage.width - btnSize) {
				actions.toggleMenu();
				return;
			}
		}

		const handledSpeed = loop.startSpeedUpdate(event);
		isUpdatingSpeed = handledSpeed;
		if (handledSpeed) {
			return;
		}

		if (!selectorApi.isRunning()) return;
		if (event.onCanvas) {
			shellSystem.launchShellFromConfig(event);
		}
	});

	mainStage.addEventListener("pointermove", (event) => {
		if (!selectorApi.isRunning()) return;
		loop.maybeUpdateSpeed(event);
	});

	mainStage.addEventListener("pointerend", () => {
		isUpdatingSpeed = false;
		loop.stopSpeedUpdate();
	});

	mainStage.addEventListener("pointerout", () => {
		if (!isUpdatingSpeed) return;
		isUpdatingSpeed = false;
		loop.stopSpeedUpdate();
	});

	window.addEventListener("keydown", (event) => {
		if (event.keyCode === 80) {
			actions.togglePause();
		} else if (event.keyCode === 79) {
			actions.toggleMenu();
		} else if (event.keyCode === 27) {
			actions.toggleMenu(false);
		}
	});
}
