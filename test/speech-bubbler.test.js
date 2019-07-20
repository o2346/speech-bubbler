const assert = require( 'assert' );
const Bubbler = require( '../speech-bubbler.js' );
const bubbler = new Bubbler();

describe( 'speech-bubbler', () => {
  it( 'should return -1 when the value is not present', () => {
    assert.equal( [1, 2, 3 ].indexOf( 4 ), -1 );
  } );
} );
