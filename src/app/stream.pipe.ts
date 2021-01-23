import { Pipe, PipeTransform } from '@angular/core';
import { IPeerIterable } from 'models/ICall';

@Pipe({
  name: 'stream',
})
export class StreamPipe implements PipeTransform {
  transform(
    peer: Map<string, IPeerIterable>
  ): IterableIterator<[string, IPeerIterable]> {
    // console.log('-----', peer);
    // const peers: IPeerIterable[] = [];
    // peer.forEach((p) => peers.push(p));
    console.log(peer.entries());
    return peer.entries();
  }
}
