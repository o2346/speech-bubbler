const assert   = require( 'assert' );
const fs       = require( 'fs' );
const Bubbler  = require( '../speech-bubbler.js' );
const bubbler  = new Bubbler();
const contents = require( './contents.json' );

describe( 'speech-bubbler', () => {

  contents.bubblerRender
    .forEach( ( obj, i ) => {
      const subject = String().concat(
        'render ',
        i,
        ' ',
        obj.text.slice( 0, 10 ).replace( /[\n\r]/g, '' ),
        '...'
      );

      it( subject, () => {
        const expected = fs.readFileSync( 'test/' + obj.path ).toString().replace( /[\n\r]$/, '' );
        const actual   = bubbler.render( obj.text, obj.option );
        assert.deepEqual( expected, actual );
      } );
    } );

  contents.vertmap
    .forEach( ( obj, i ) => {
      const subject = String().concat(
        'vertmap ',
        i,
        ' ',
        obj.text.slice( 0, 10 ).replace( /[\n\r]/g, '' ),
        '...'
      );

      it( subject, () => {
        const expected = fs.readFileSync( 'test/' + obj.path ).toString();
        const actual   = bubbler.vertmap( obj.text );
        assert.deepEqual( expected, actual );
      } );
    } );
} );
