#!/usr/bin/env node

import { promptProjectOptions } from './prompts/project'

console.log('Hello, CLI!')
const val = await promptProjectOptions('lib')
console.log(val)
