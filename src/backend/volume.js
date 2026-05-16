// Volume Spike Detection - Simple, focused implementation
class VolumeSpike {
  constructor(multiplier = 2.0, period = 20) {
    this.multiplier = multiplier;
    this.period = period;
    this.volumes = [];
  }

  // Calculate average volume
  calculateAverageVolume(volumes) {
    if (volumes.length === 0) return 0;
    return volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  }

  // Detect volume spike
  detectSpike(currentVolume, historicalVolumes) {
    if (historicalVolumes.length < this.period) return null;

    const avgVolume = this.calculateAverageVolume(historicalVolumes.slice(-this.period));
    const volumeRatio = currentVolume / avgVolume;

    if (volumeRatio >= this.multiplier) {
      const strength = volumeRatio >= 3 ? 'STRONG' : 'MODERATE';
      const confidence = Math.min(95, 70 + (volumeRatio - this.multiplier) * 15);

      return {
        type: 'Volume Spike',
        bias: 'NEUTRAL', // Volume spike is neutral, indicates unusual activity
        strength,
        confidence: Math.round(confidence),
        message: `Unusual volume activity detected (${volumeRatio.toFixed(1)}x normal)`,
        volumeRatio: volumeRatio.toFixed(1)
      };
    }

    return null;
  }

  // Get signal from current market data
  getSignal(currentVolume, historicalVolumes) {
    return this.detectSpike(currentVolume, historicalVolumes);
  }
}

export default VolumeSpike;
