import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gpsService } from './gpsService.js';

describe('GPSService', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => [{ id: '1' }]
			})
		);
		gpsService.stopLiveUpdates();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		gpsService.stopLiveUpdates();
	});

	it('getDevices stores and returns payload', async () => {
		const devices = await gpsService.getDevices();
		expect(devices).toEqual([{ id: '1' }]);
		expect(gpsService.devices).toEqual([{ id: '1' }]);
	});

	it('getDevicesByGroup fetches group endpoint', async () => {
		await gpsService.getDevicesByGroup('g1');
		expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/devices/group/g1'));
	});

	it('getDeviceLocation fetches location endpoint', async () => {
		await gpsService.getDeviceLocation('d1');
		expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/devices/d1/location'));
	});

	it('getGroups fetches groups endpoint', async () => {
		await gpsService.getGroups();
		expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/groups'));
	});

	it('getDeviceHistory builds query params', async () => {
		const start = new Date('2026-01-01T00:00:00Z');
		const end = new Date('2026-01-02T00:00:00Z');
		await gpsService.getDeviceHistory('d1', start, end);
		expect(fetch).toHaveBeenCalledWith(expect.stringContaining('startDate='));
	});

	it('startLiveUpdates polls devices', async () => {
		vi.useFakeTimers();
		const callback = vi.fn();
		gpsService.startLiveUpdates(callback, 1000);
		await vi.advanceTimersByTimeAsync(1000);
		expect(callback).toHaveBeenCalled();
		vi.useRealTimers();
	});

	it('getMockDevices returns sample fleet', () => {
		expect(gpsService.getMockDevices()).toHaveLength(3);
	});

	it('throws on failed fetch', async () => {
		fetch.mockResolvedValueOnce({ ok: false, status: 500 });
		await expect(gpsService.getDevices()).rejects.toThrow('HTTP error! status: 500');
	});

	it('throws on failed history fetch', async () => {
		fetch.mockResolvedValueOnce({ ok: false, status: 404 });
		await expect(gpsService.getDeviceHistory('d1', new Date(), new Date())).rejects.toThrow(
			'HTTP error! status: 404'
		);
	});
});
