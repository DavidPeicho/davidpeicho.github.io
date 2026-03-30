import {Component} from "@wonderlandengine/api";

export class Fullscreen extends Component {
	static TypeName ='fullscreen';

	private _icon: HTMLElement | null = null;

	onActivate() {
		const icon = document.createElement("p");
		icon.innerHTML = '⛶';
		icon.style.position = 'absolute';
		icon.style.bottom = '0';
		icon.style.right = '24px';
		icon.style.fontSize = '78px';
		icon.style.margin = '0 0 0 0';
		icon.style.color = '#ecf0f1';
		icon.style.cursor = 'pointer';
		icon.style.userSelect = 'none';
		icon.addEventListener('click', () => {
			if (document.fullscreenElement) {
				document.exitFullscreen().then(() => {}).catch((err) => console.error(err))
			} else {
				document.documentElement.requestFullscreen();
			}
		});
		document.body.appendChild(icon);
		this._icon = icon;
	}

	onDeactivate(): void {
		if (!this._icon) return;
		this._icon.remove();
	}
}
