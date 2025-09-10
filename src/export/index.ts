import {exportParserSyntax} from '../parser/index'

// YAML (default)
const yamlSchema = exportParserSyntax('yaml')
console.log(yamlSchema);

// JSON
const jsonSchema = exportParserSyntax('json')
