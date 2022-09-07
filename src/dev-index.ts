import { compileConfigSync, ConfigField } from './index';

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
    @ConfigField({ arrayOf: DbConfig })
    db!: DbConfig[];

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

  const { config } = compileConfigSync(AppConfig, {
    ymlFiles: ['eba.yaml'],
  });

  console.log(config);
};

main();
