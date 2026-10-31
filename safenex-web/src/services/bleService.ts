import { BLE_SERVICE_UUID, BLE_SOS_CHAR_UUID, BLE_STATUS_CHAR_UUID } from '../lib/constants';
import { BleBandState } from '../types';

export class BleService {
  private device: any = null;
  private server: any = null;
  private onSosCallback: ((source: string) => void) | null = null;
  private onStateChange: ((state: BleBandState) => void) | null = null;

  private currentState: BleBandState = {
    connected: false,
    name: 'SafeNex Band',
    batteryLevel: null,
    serviceAvailable: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
    simulated: false,
    isScanning: false,
    scanError: null,
  };

  subscribe(onState: (state: BleBandState) => void, onSos: (source: string) => void) {
    this.onStateChange = onState;
    this.onSosCallback = onSos;
    onState(this.currentState);
  }

  getState(): BleBandState {
    return this.currentState;
  }

  isWebBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  async scanAndConnect(): Promise<{ success: boolean; error?: string }> {
    if (!this.isWebBluetoothSupported()) {
      const err = 'Web Bluetooth API is not supported by your current browser. Google Chrome, Microsoft Edge, or Android Chrome is required.';
      this.updateState({
        isScanning: false,
        scanError: err,
        serviceAvailable: false,
      });
      return { success: false, error: err };
    }

    this.updateState({ isScanning: true, scanError: null });

    try {
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'SAFENEX' }],
        optionalServices: [BLE_SERVICE_UUID, 'battery_service']
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.updateState({
          connected: false,
          name: `${this.device?.name || 'SafeNex Band'} (Disconnected)`,
          batteryLevel: null,
          isScanning: false,
          simulated: false,
        });
      });

      this.server = await this.device.gatt.connect();

      let batteryValue: number | null = null;

      // 1. Discover Primary SafeNex Service
      try {
        const service = await this.server.getPrimaryService(BLE_SERVICE_UUID);

        // Subscribe to Panic SOS notification characteristic
        try {
          const sosChar = await service.getCharacteristic(BLE_SOS_CHAR_UUID);
          await sosChar.startNotifications();
          sosChar.addEventListener('characteristicvaluechanged', (e: any) => {
            const rawVal = new TextDecoder().decode(e.target.value);
            if (this.onSosCallback) {
              this.onSosCallback(`BLE_BAND_BUTTON: ${rawVal || 'PANIC'}`);
            }
          });
        } catch (e) {
          console.warn('Could not bind SOS characteristic notifications:', e);
        }

        // Subscribe to Battery/Status characteristic
        try {
          const statusChar = await service.getCharacteristic(BLE_STATUS_CHAR_UUID);
          const val = await statusChar.readValue();
          batteryValue = val.getUint8(0);

          await statusChar.startNotifications();
          statusChar.addEventListener('characteristicvaluechanged', (e: any) => {
            const level = e.target.value.getUint8(0);
            this.updateState({ batteryLevel: level });
          });
        } catch (e) {
          console.warn('Could not read BLE status characteristic:', e);
        }
      } catch (e) {
        console.warn('Primary SafeNex GATT service not found on device:', e);
      }

      this.updateState({
        connected: true,
        name: this.device.name || 'ESP32 SAFENEX-BAND',
        batteryLevel: batteryValue,
        serviceAvailable: true,
        isScanning: false,
        simulated: false,
        lastHeartbeat: new Date().toLocaleTimeString(),
        scanError: null,
      });

      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || 'Bluetooth connection was cancelled or timed out.';
      this.updateState({
        isScanning: false,
        scanError: errMsg.includes('User cancelled') ? 'Pairing cancelled by user.' : errMsg,
      });
      return { success: false, error: errMsg };
    }
  }

  disconnect() {
    if (this.device && this.device.gatt?.connected) {
      try {
        this.device.gatt.disconnect();
      } catch (e) {
        console.warn('Error during GATT disconnect:', e);
      }
    }
    this.updateState({
      connected: false,
      name: 'SafeNex Band (Offline)',
      batteryLevel: null,
      isScanning: false,
      simulated: false,
      scanError: null,
    });
  }

  /**
   * Explicit hardware testing simulator for development environments without physical ESP32.
   */
  toggleVirtualBand(enable: boolean) {
    if (enable) {
      this.updateState({
        connected: true,
        name: 'ESP32 SafeNex Virtual Band (Test Mode)',
        batteryLevel: 88,
        serviceAvailable: true,
        simulated: true,
        isScanning: false,
        lastHeartbeat: new Date().toLocaleTimeString(),
        scanError: null,
      });
    } else {
      this.disconnect();
    }
  }

  triggerVirtualHardwareButton() {
    if (this.currentState.simulated && this.onSosCallback) {
      this.onSosCallback('BLE_BAND_BUTTON');
    }
  }

  private updateState(partial: Partial<BleBandState>) {
    this.currentState = { ...this.currentState, ...partial };
    if (this.onStateChange) {
      this.onStateChange(this.currentState);
    }
  }
}

export const bleService = new BleService();
