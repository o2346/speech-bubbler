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
const edgeLeft = '＞　';
const edgeRight = '　＜';

class Bubbler {

  constructor() {
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
    str.replace( new RegExp( '[\x09-\x0d\x20-\x7e\uff61-\uff9f]|(.)', 'gu' ), ( _, isFull ) => width += isFull ? 1 : 0.5 );
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
  padding( str, distance, centering ) {
    const pad = String().concat( '　'.repeat( Math.ceil( distance ) ) );
    if( centering ) {
      const pads = [
        Math.trunc( pad.length / 2 ),
        Math.ceil( pad.length / 2 )
      ]
        .map( ( p ) => {
          return '　'.repeat( p );
        } );
      pads[ 1 ] = ( Number.isInteger( distance ) ? pads[ 1 ] : pads[ 1 ].replace( /\s$/, ' ' ) ) + edgeRight;
      //console.log( pad.length + ' ' + pads.join( '' ).length );
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

    return str.split( breaks )
      .map( ( l ) => {
        return String().concat( edgeLeft, l, edgeRight );
      } )
      .map( ( l, i, a ) => {
        const maxLength = Math.max( ...a.map( ( _l ) => { return this.getLengthOstensible( _l ); } ) );
        let ans = '';
        const distance = maxLength - this.getLengthOstensible( l );
        if( distance > 0 ) {
          ans = this.padding( l, distance, centering );
        } else {
          ans = l;
        }
        return ans;
      } )
      .map( ( l, i, a ) => {
        const maxLength = Math.max( ...a.map( ( _l ) => { return this.getLengthOstensible( _l ); } ) );
        return Number.isInteger( maxLength ) ? l : l.replace( new RegExp( edgeRight + '$' ), ' ＜' );
      } )
      .join( '\n' );
  }

  /**
   * getUpper
   *
   * @param str
   * @returns {undefined}
   */
  getUpperLower( str ) {
    const edgeUpper    = '人';
    const edgeLower    = '^Y';
    const cornerUpper = '＿';
    const cornerLower = '￣';

    const maxLength = Math.max( ...str.split( breaks ).map( ( _l ) => { return this.getLengthOstensible( _l ); } ) );
    const upper = String().concat(
      cornerUpper,
      edgeUpper.repeat( maxLength - 2 ),
      cornerUpper
    );
    const lower = String().concat(
      cornerLower,
      edgeLower.repeat( maxLength - 3 ),
      cornerLower
    )
      .replace(
        new RegExp( '^' + cornerLower + '\\' + edgeLower ),
        ' ' + cornerLower + 'Y'
      );

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
    const contents = this.obtainInnerContents( str, queries );
    const uplw     = this.getUpperLower( contents );

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
    //console.log( parseQueries( 'foo', '?foo=lorem&bar=&baz' ) )  //
    const queries = process.argv
      .find( ( argv ) => {
        return argv.match( /\?(.+\=.*&?)+/ );
      } );
    //console.log( parseQueries( 'align', queries ) );
    const input = [];
    require( 'readline' )
      .createInterface( { input: process.stdin } )
      .on( 'line', ( l ) => { input.push( l ); } )
      .on( 'close', () => { process.stdout.write( this.render( input.join( '\n' ), queries ) ); } );
  }
}

//this ones works well as above
//http://tanakh.jp/tools/sudden.html
//console.log( require );
//console.log( module );
//console.log( process.stdin.isTTY );
if ( typeof require !== 'undefined' && require.main === module && !process.stdin.isTTY ) {
  //console.log( 'called directly' );
  new Bubbler().main();
  //https://www.google.co.jp/search?&tbm=isch&safe=off&q=高橋啓介の8200系個別分散式VVVFはダテじゃねえ+複線ドリフト
  //console.log( render( '僕アルバイトォォｫｫ!!' ) );
} else if( typeof require !== 'undefined' && require.main === module && process.stdin.isTTY ) {
  function writeto(  data, file ) {
    require( 'fs' ).writeFileSync( file, data );
  }
  writeto( new Bubbler().render( '複線\nﾄﾞﾘﾌﾄ!!' ), 'test/multi_track_drifting.txt' );
  writeto( new Bubbler().render( 'はっえぇーーっ!!\nバカッ速!!\n高橋啓介の8200系\n個別分散式VVVFはダテじゃねぇ' ), 'test/amaizing_8200_vvvf.txt' );
  writeto( new Bubbler().render( '勝負になんねー\n2000系のフル加速なんて\nまるで止まってるようにしか\n見えねーよｫ!!' ), 'test/2000_is_like_too_slow.txt' );
  writeto( new Bubbler().render( 'どうしたんだ\n今日に限って8200が\nやけにノロく感じる!!' ), 'test/8200_is_too_fucking_slow.txt' );
  writeto( new Bubbler().render( 'ｸｿｯﾀﾚが\nﾊﾟﾝﾀ一基\n下がってんじゃねーのか！？' ), 'test/is_a_pantograph_is_fucking_absent.txt' );
  writeto( new Bubbler().render( 'だまりゃ！麿は恐れ多くも帝より三位の位を賜わり中納言を務めた身じゃ！\nすなわち帝の臣であって徳川の家来ではおじゃらん！\nその麿の屋敷内で狼藉を働くとは言語道断！\nこの事直ちに帝に言上し、きっと公儀に掛け合うてくれる故、心しておじゃれ！', 'https://hoge.com?align=center' ), 'test/shut_the_fuck_up_i_am_so_celebrated.txt' );
  writeto( new Bubbler().vertmap( '複線\nドリフト!!' ), 'test/multi_track_drifting.vert.txt' );
  writeto( new Bubbler().vertmap( 'Multi-\nTrack\nDrifting!!' ), 'test/en_multi_track_drifting.vert.txt' );
} else if( typeof module === 'undefined' ) {
  // should be a browser on client
} else if( typeof module !== 'undefined' ) {
  //console.log('required as a module');
  //this is for developers, for unit testing framework
  module.exports = Bubbler;
}
