// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Clase para manejar los servicios de GPS
class GPSService {
	constructor() {
		this.baseURL = API_BASE_URL;
		this.devices = [];
		this.liveInterval = null;
	}

	// Obtener todos los dispositivos
	async getDevices() {
		try {
			const response = await fetch(`${this.baseURL}/devices`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			this.devices = data;
			return data;
		} catch (error) {
			console.error('Error fetching devices:', error);
			throw error;
		}
	}

	// Obtener dispositivos por grupo
	async getDevicesByGroup(groupId) {
		try {
			const response = await fetch(`${this.baseURL}/devices/group/${groupId}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching devices by group:', error);
			throw error;
		}
	}

	// Obtener posición actual de un dispositivo
	async getDeviceLocation(deviceId) {
		try {
			const response = await fetch(`${this.baseURL}/devices/${deviceId}/location`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching device location:', error);
			throw error;
		}
	}

	// Iniciar actualizaciones en tiempo real
	startLiveUpdates(callback, interval = 5000) {
		if (this.liveInterval) {
			this.stopLiveUpdates();
		}

		this.liveInterval = setInterval(async () => {
			try {
				const devices = await this.getDevices();
				callback(devices);
			} catch (error) {
				console.error('Error in live updates:', error);
			}
		}, interval);
	}

	// Detener actualizaciones en tiempo real
	stopLiveUpdates() {
		if (this.liveInterval) {
			clearInterval(this.liveInterval);
			this.liveInterval = null;
		}
	}

	// Obtener grupos disponibles
	async getGroups() {
		try {
			const response = await fetch(`${this.baseURL}/groups`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching groups:', error);
			throw error;
		}
	}

	// Obtener historial de un dispositivo
	async getDeviceHistory(deviceId, startDate, endDate) {
		try {
			const params = new URLSearchParams({
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString()
			});

			const response = await fetch(`${this.baseURL}/devices/${deviceId}/history?${params}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching device history:', error);
			throw error;
		}
	}

	// Simular datos para desarrollo (cuando no hay API disponible)
	getMockDevices() {
		return [
			{
				id: '1',
				name: 'Equipo 1',
				lat: 19.4326,
				lng: -99.1332,
				lastUpdate: new Date().toLocaleString(),
				speed: 45,
				status: 'active',
				icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
			},
			{
				id: '2',
				name: 'Equipo 2',
				lat: 19.4342,
				lng: -99.1350,
				lastUpdate: new Date().toLocaleString(),
				speed: 32,
				status: 'active',
				icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
			},
			{
				id: '3',
				name: 'Equipo 3',
				lat: 19.4300,
				lng: -99.1300,
				lastUpdate: new Date().toLocaleString(),
				speed: 0,
				status: 'stopped',
				icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
			}
		];
	}
}

// Exportar una instancia singleton
export const gpsService = new GPSService(); 