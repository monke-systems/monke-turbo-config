import { compileConfig } from '../src';

describe('Empty config (e2e)', () => {
  it('Should not throw on empty config', async () => {
    class Empty {}

    await expect(compileConfig(Empty)).resolves.not.toThrow();
  });

  it('Should return class instance without changes', async () => {
    class WithField {
      notConfigField = 123;
    }

    const { config } = await compileConfig(WithField);

    expect(config).toBeInstanceOf(WithField);

    const expected = new WithField();
    expected.notConfigField = 123;

    expect(config).toStrictEqual(expected);
  });
});
