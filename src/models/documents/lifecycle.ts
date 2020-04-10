abstract class Lifecycle {
  async onPostDelete(): Promise<void> {}

  async onPostSave(): Promise<void> {}

  async onPostValidate(): Promise<void> {}

  async onPreDelete(): Promise<void> {}

  async onPreSave(): Promise<void> {}

  async onPreValidate(): Promise<void> {}

  async onPostUpdate(): Promise<void> {}

  async onPreUpdate(): Promise<void> {}
}

export default Lifecycle;
