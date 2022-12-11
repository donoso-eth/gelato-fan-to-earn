import { readFileSync } from 'fs-extra';
import { task } from 'hardhat/config';
import { initEnv } from '../helpers/utils';
import { join } from 'path';

const contract_path_relative = '../src/assets/contracts';
const processDir = process.cwd();
const contract_path = join(processDir, contract_path_relative);
const contract_config = JSON.parse(
  readFileSync(join(processDir, 'contract.config.json'), 'utf-8')
) as { [key: string]: any };

let ops = "0xc1C6805B857Bef1f412519C4A842522431aFed39"

task('verify-contract', 'verify').setAction(async ({}, hre) => {
  let deployContract = 'fanToEarn';
  let toDeployContract = contract_config[deployContract];
  const toVerifyApp = JSON.parse(
    readFileSync(
      `${contract_path}/${toDeployContract.jsonName}_metadata.json`,
      'utf-8'
    )
  );



  
  await hre.run('verify:verify', {
    address: toVerifyApp.address,
    constructorArguments: [ops] ,
  });
});
