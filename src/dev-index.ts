import { compileConfig } from './compiler/compiler';
import { ConfigField } from './decorators/config-field-decorator';

const main = async () => {
  class DbConfig {
    @ConfigField()
    host!: string;

    @ConfigField()
    port = 3306;

    @ConfigField()
    autoReconnect = true;
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

  const { config } = await compileConfig(AppConfig);

  console.log(config);
};

main().catch(console.error);
