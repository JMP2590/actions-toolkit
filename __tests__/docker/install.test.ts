/**
 * Copyright 2023 actions-toolkit authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {describe, expect, jest, test, beforeEach, afterEach, it} from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import osm = require('os');

import {Install} from '../../src/docker/install';

// prettier-ignore
const tmpDir = path.join(process.env.TEMP || '/tmp', 'docker-install-jest');

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(function () {
  rimraf.sync(tmpDir);
});

describe('download', () => {
  // prettier-ignore
  test.each([
    ['v19.03.14', 'linux'],
    ['v20.10.22', 'linux'],
    ['v20.10.22', 'darwin'],
    ['v20.10.22', 'win32'],
  ])(
  'acquires %p of docker (%s)', async (version, platformOS) => {
    jest.spyOn(osm, 'platform').mockImplementation(() => platformOS as NodeJS.Platform);
    const install = new Install({
      version: version,
      runDir: tmpDir,
    });
    const toolPath = await install.download();
    expect(fs.existsSync(toolPath)).toBe(true);
  }, 100000);
});

describe('getRelease', () => {
  it('returns latest docker GitHub release', async () => {
    const release = await Install.getRelease('latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns v23.0.0 buildx GitHub release', async () => {
    const release = await Install.getRelease('v23.0.0');
    expect(release).not.toBeNull();
    expect(release?.id).toEqual(91109643);
    expect(release?.tag_name).toEqual('v23.0.0');
    expect(release?.html_url).toEqual('https://github.com/moby/moby/releases/tag/v23.0.0');
  });

  it('unknown release', async () => {
    await expect(Install.getRelease('foo')).rejects.toThrow(new Error('Cannot find Docker release foo in https://raw.githubusercontent.com/docker/actions-toolkit/main/.github/docker-releases.json'));
  });
});
