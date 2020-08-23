import * as path from "path";
import modudeAlias from 'module-alias';

const files = path.resolve(__dirname, '../..');

modudeAlias.addAliases({
    '@src': path.join(files, 'src'),
    '@test': path.join(files, 'test')
});