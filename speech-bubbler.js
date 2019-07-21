#!./node
/**
 * Balloon Message AA Generator
 * Alternative over https://totuzennosi.sacnoha.com/
 * 'Sudden Death' comes from https://dic.nicovideo.jp/a/%E7%AA%81%E7%84%B6%E3%81%AE%E6%AD%BB
 *
 * It's good one.. https://www.osstech.co.jp/cgi-bin/echo-sd
 */

'use strict';

//https://uxmilk.jp/50240
const breaks = /\r\n|\n|\r/;

class Bubbler {

  constructor() {
    //https://en.wikipedia.org/wiki/Box-drawing_character
    this.bubbleEdges = {
      'default': {
        left: '＞',
        right: '＜',
        upper: '人',
        lower: '^Y',
        upperCenter: '人',
        cornerUpperLeft: '＿',
        cornerUpperRight: '＿',
        cornerLowerLeft: '￣',
        cornerLowerRight: '￣',
        upperReduceAmount: 2,
        lowerReduceAmount: 3,
        appendUpper: '',
        appendLower: '^Y',
      },
      'rectanble': {
        left: '│',
        right: '│',
        upper: '──',
        lower: '──',
        upperCenter: '─',
        cornerUpperLeft: '┌',
        cornerUpperRight: '┐',
        cornerLowerLeft: '└',
        cornerLowerRight: '┘',
        upperReduceAmount: 2,
        lowerReduceAmount: 2,
        appendUpper: '─',
        appendLower: '─',
      },
      'label': {
        left: '┃',
        right: '┃',
        upper: '━━',
        lower: '━━',
        upperCenter: '┷',
        cornerUpperLeft: '┏',
        cornerUpperRight: '┓',
        cornerLowerLeft: '┗',
        cornerLowerRight: '┛',
        upperReduceAmount: 2,
        lowerReduceAmount: 2,
        appendUpper: '━',
        appendLower: '━',
      }
    };
    this.setDefault();
  }

  setPadding( int ) {
    if( !isNaN( parseInt( int, 10 ) ) ) {
      this.padding = '　'.repeat( int );
    }
  }

  setEdge( type ) {
    if( typeof type === 'string' && this.bubbleEdges[ type ] ) {
      this.edge = this.bubbleEdges[ type ];
    }
  }

  setDefault() {
    this.edge = this.bubbleEdges.default;
    this.padding = '　'.repeat( 1 );
    this.setEdge( 'default' );
  }

  /**
   * vertmap
   *
   * @param str
   * @returns {undefined}
   */
  vertmap( str ) {
    const ignoreChars = [
      /\!/,
      /\?/
    ];
    const containsDoubleWith = ( str.match( /[^\x20-\x7E\xA1-\xDF\s]/ ) );
    const pad = ( containsDoubleWith ? '　' : ' ' );

    const ignoreCharDouble = '＜ＩＧＨＯＲＥＣＨＡＲＤＯＵＢＬＥ＝';

    return str
      .split( '\n' )
      .map( ( s, i, a ) => {
        const max = Math.max( ...a.map( ( _l ) => _l.length ) );
        return s.concat( pad.repeat( max - s.length ) );
      } )
      .map( ( s ) => {
        return s.split( '' );
      } )
      .map( ( s, index ) => {
        return s.map( ( c, i ) => {
          return {
            char: c,
            x: i,
            y: index
          };
        } );
      } )
      .reduce( ( accum, current ) => {
        const cloneAccum = [...accum]; //https://www.samanthaming.com/tidbits/35-es6-way-to-clone-an-array
        current.forEach( ( curr ) => {
          if( !cloneAccum[ curr.x ] ) {
            cloneAccum[ curr.x ] = [];
          }
          cloneAccum[ curr.x ][ curr.y ] = curr.char;
        } );
        return cloneAccum;
      }, [] )
      .reduce( ( accum, chars, index, array ) => {
        const curr = chars
          .map( ( c, i ) => {
            if( accum[ index - 1 ] && accum[ index - 1 ][ i ].match( new RegExp( ignoreCharDouble ) ) ) {
              return '';
            }

            const foldUp = [
              //containsDoubleWith,
              array[ index + 1 ] && ignoreChars.some( ( ic ) => array[ index + 1 ][ i ].match( ic ) ),
              ignoreChars.some( ( ic ) => c.match( ic ) )
            ]
              .every( ( isAffirmative ) => {
                return isAffirmative;
              } );

            if( foldUp ) {
              return ignoreCharDouble + c + array[ index + 1 ][ i ] + '＞';
            }

            return c;
          } );
        return accum.concat( [ curr ] );
      }, [] )
      .filter( ( chars ) => {
        return !chars.join( '' ).match( new RegExp( '^' + pad + '+$' ) );
      } )
      .map( ( chars ) => {
        return chars.reverse().join( '' );
      } )
      .join( '\n' )
      .replace( new RegExp( '([\x20-\x7E\xA1-\xDF])', 'g' ), ' $1' )
      .replace( new RegExp( '＜ＩＧＨＯＲＥＣＨＡＲＤＯＵＢＬＥ＝(.+)＞', 'g' ), ( m, p1 ) => { return p1.replace( /\s/g, '' ); } );
  }

  /**
   * parseQueries
   * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
   * @param arg
   * @param givenParams
   * @returns {undefined}
   */
  parseQueries( arg, params ) {
    //const params = ( givenParams ? givenParams : window.location.href );
    const regex = new RegExp( '[?&]' + arg.replace( /[\[\]]/g, '\\$&' ) + '(=([^&#]*)|&|#|$)' );
    const results = regex.exec( params );
    if ( !results ) return null;
    if ( !results[ 2 ] ) return '';
    return decodeURIComponent( results[ 2 ].replace( /\+/g, ' ' ) );
  }

  /**
   * getLengthOstensible
   * http://var.blog.jp/archives/76281025.html
   * @param str
   * @returns {undefined}
   */
  getLengthOstensible( str ) {
    let width = 0;
    str.replace( new RegExp( '[⊊⊋\x09-\x0d\x20-\x7e\uff61-\uff9f]|(.)', 'gu' ), ( _, isFull ) => width += isFull ? 1 : 0.5 );
    return width;
  }

  /**
   * padding
   *
   * @param str
   * @param distance
   * @param centering
   * @returns {undefined}
   */
  padRightSurface( str, distance, centering ) {
    const pad = String().concat( '　'.repeat( Math.ceil( distance ) ) );
    const edgeLeft = this.edge.left.concat( this.padding );
    const edgeRight = this.padding.concat( this.edge.right );
    if( centering ) {
      const pads = [
        Math.trunc( pad.length / 2 ),
        Math.ceil( pad.length / 2 )
      ]
        .map( ( p ) => {
          return '　'.repeat( p );
        } );
      pads[ 1 ] = ( Number.isInteger( distance ) ? pads[ 1 ] : pads[ 1 ].replace( /\s$/, ' ' ) ) + edgeRight;
      return str.replace(
        new RegExp( '^' + edgeLeft ),
        edgeLeft + pads[ 0 ]
      ).replace(
        new RegExp( edgeRight + '$' ),
        pads[ 1 ]
      );
    }

    return str.replace(
      new RegExp( edgeRight + '$' ),
      ( Number.isInteger( distance ) ? pad : pad.replace( /\s$/, ' ' ) ) + edgeRight
    );
  }

  /**
   * obtainInnerContents
   *
   * @param str
   * @returns {undefined}
   */
  obtainInnerContents( str, queries ) {
    let centering = false;
    if( this.parseQueries( 'align', queries ) === 'center' ) {
      centering = true;
    }

    const edgeLeft = this.edge.left.concat( this.padding );
    const edgeRight = this.padding.concat( this.edge.right );
    return str.split( breaks )
      .filter( ( l ) => {
        return l.length > 0;
      } )
      .map( ( l ) => {
        return String().concat( edgeLeft, l, edgeRight );
      } )
      .map( ( l, i, a ) => {
        const maxLength = Math.max( ...a.map( ( _l ) => { return this.getLengthOstensible( _l ); } ) );
        let ans = '';
        const distance = maxLength - this.getLengthOstensible( l );
        if( distance > 0 ) {
          ans = this.padRightSurface( l, distance, centering );
        } else {
          ans = l;
        }
        return ans;
      } )
      /*
      .map( ( l, i, a ) => {
        const maxLength = Math.max( ...a.map( ( _l ) => { return this.getLengthOstensible( _l ); } ) );
        return Number.isInteger( maxLength ) ? l : l.replace( new RegExp( edgeRight + '$' ), this.padding.concat( this.edge.right ) );
      } )
      .map( ( l, i, a ) => {
        const re = new RegExp( '\s'.concat( this.edge.right, '$' ) );
        const isSurplus = a.every( ( _l ) => { return _l.match( re ); } ) && this.padding.length === 0;
        if( isSurplus ) {
          return l.replace( re, this.edge.right );
        }
        return l;
      } )
      */
      .join( '\n' );
  }

  /**
   * getUpper
   *
   * @param str
   * @returns {undefined}
   */
  getUpperLower( str ) {
    const edgeUpper    = this.edge.upper;
    const edgeLower    = this.edge.lower;
    const cornerUpperLeft  = this.edge.cornerUpperLeft;
    const cornerUpperRight  = this.edge.cornerUpperRight;
    const cornerLowerLeft  = this.edge.cornerLowerLeft;
    const cornerLowerRight  = this.edge.cornerLowerRight;

    const maxLength = Math.max( ...str.split( breaks ).map( ( _l ) => { return this.getLengthOstensible( _l ); } ) );
    const isInt = Number.isInteger( maxLength );
    const appendUpper = isInt ? '' : this.edge.appendUpper;
    const appendLower = isInt ? '' : this.edge.appendLower;

    const upper = String().concat(
      cornerUpperLeft,
      edgeUpper.repeat( maxLength - this.edge.upperReduceAmount ).concat( appendUpper ),
      cornerUpperRight
    )
      .split( '' )
      .reduce( ( accum, c, i, a ) => {
        if( i === Math.ceil( this.getLengthOstensible( a.join( '' ) ) / 2 ) - 1 ) {
          return accum.concat( this.edge.upperCenter );
        }
        return accum.concat( c );
      }, '' ).replace( /━━┷━━/, '-━┷━-' );

    const lower = String().concat(
      cornerLowerLeft,
      edgeLower.repeat( maxLength - this.edge.lowerReduceAmount ).concat( appendLower ),
      cornerLowerRight
    )
      .replace(
        ( this.edge === this.bubbleEdges.default ? new RegExp( '^' + cornerLowerLeft + '\\' + edgeLower ) : /$^/ ),
        ' ' + cornerLowerLeft + 'Y'
      )
      .replace( /^￣￣$/, '￣Y￣' );

    return [ upper, lower ];
  }
  /**
   * render
   *
   * @param str
   * @returns {undefined}
   */
  render( str, queries ) {
    if( !str ) {
      return null;
    }
    const edgeType = this.parseQueries( 'edge', queries );
    this.setEdge( edgeType );
    const paddingAmount = this.parseQueries( 'padding', queries );
    this.setPadding( paddingAmount );
    const isProportional = this.parseQueries( 'propotional', queries ) === '0';
    if( isProportional ) {
      this.edge.upper = this.edge.upper.charAt( 0 );
      this.edge.lower = this.edge.lower.charAt( 0 );
    }
    let contents = null;
    if( this.parseQueries( 'vertical', queries ) ) {
      contents = this.obtainInnerContents( this.vertmap( str ), queries );
    } else {
      contents = this.obtainInnerContents( str, queries );
    }
    const uplw     = this.getUpperLower( contents );

    this.setDefault();

    return [
      uplw[ 0 ],
      contents,
      uplw[ 1 ]
    ].join( '\n' );
  }

  /**
   * main func
   *
   * @returns {undefined}
   */
  main() {
    const queries = process.argv
      .find( ( argv ) => {
        return argv.match( /\?(.+\=.*&?)+/ );
      } );
    const input = [];
    require( 'readline' )
      .createInterface( { input: process.stdin } )
      .on( 'line', ( l ) => { input.push( l ); } )
      .on( 'close', () => { process.stdout.write( this.render( input.join( '\n' ), queries ) ); } );
  }
}

//this ones works well as above
//http://tanakh.jp/tools/sudden.html
if ( typeof require !== 'undefined' && require.main === module && !process.stdin.isTTY ) {
  //console.log( 'called directly' );
  new Bubbler().main();
  //https://www.google.co.jp/search?&tbm=isch&safe=off&q=高橋啓介の8200系個別分散式VVVFはダテじゃねえ+複線ドリフト
} else if( typeof require !== 'undefined' && require.main === module && process.stdin.isTTY ) {
  //for f in test/*.txt; do cat $f; printf "\n$f\n";  done
  const b = new Bubbler();
  console.log( b.render( 'ここは,ﾋﾝﾄ･ﾏｰｹｯﾄ\n⊊ﾆ|ＴＯＫＹＵ|ﾆ⊋ \n E|ＨＡＮＤＳ|ﾖ ', '?edge=rectanble&padding=0&align=center' ) );
  console.log( b.render( '僕アルバイトォォｫｫ!!', '?edge=rectanble&padding=2' ) );
  console.log( b.render( '痔が\nなおります\nように', '?edge=label&vertical=0&padding=0' ) );
} else if( typeof module === 'undefined' ) {
  // should be a browser on client
} else if( typeof module !== 'undefined' ) {
  //console.log('required as a module');
  //this is for developers, for unit testing framework
  module.exports = Bubbler;
}
