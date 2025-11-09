export class PubSub<T> {
  private readonly channels: Record<string, Array<(message: T) => void>> = {}

  subscribe(key: string, subscriber: (message: T) => void) {
    if (!this.channels[key]) {
      this.channels[key] = []
    }

    this.channels[key].push(subscriber)
  }

  publish(key: string, message: T) {
    if (!this.channels[key]) {
      return
    }

    for (const subscriber of this.channels[key]) {
      subscriber(message)
    }
  }
}
