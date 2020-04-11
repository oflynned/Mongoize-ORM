abstract class Lifecycle {
  protected async onPostDelete(): Promise<void> {}

  protected async onPostSave(): Promise<void> {}

  protected async onPostValidate(): Promise<void> {}

  protected async onPreDelete(): Promise<void> {}

  protected async onPreSave(): Promise<void> {}

  protected async onPreValidate(): Promise<void> {}

  protected async onPostUpdate(): Promise<void> {}

  protected async onPreUpdate(): Promise<void> {}
}

export default Lifecycle;
