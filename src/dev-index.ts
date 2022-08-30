import { generateConfigDoc, ConfigField, CONFIG_SOURCE } from './index';

const main = () => {
  class DbConfig {
    @ConfigField()
    host!: string;

    @ConfigField()
    port: number = 3306;

    @ConfigField()
    autoReconnect: boolean = true;
  }

  class AppConfig {
    @ConfigField({ nested: true })
    db!: DbConfig;

    @ConfigField({
      arrayOf: 'strings',
      yamlKey: 'services.manager.tasks',
      cliKey: 'servicesList',
      arraySeparator: ':',
    })
    tasks!: string[];
  }

  process.env.TASKS = 'opa:zhopa';
  process.env.DATE = '2010-06-09';

  generateConfigDoc(AppConfig, {
    title: 'Some app doc',
    writeToFile: 'CONFIG_REFERENCE.md',
    keysType: CONFIG_SOURCE.ENV,
  });
};

main();
