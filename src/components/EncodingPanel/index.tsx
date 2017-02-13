import * as React from 'react';
import {connect} from 'react-redux';
import {Channel} from 'vega-lite/src/channel';
import {Mark} from 'vega-lite/src/mark';

import { SHELF_FIELD_ADD, SHELF_FIELD_REMOVE, SHELF_MARK_CHANGE_TYPE } from '../../actions/shelf';
import {ShelfFieldDef, State, UnitShelf} from '../../models';
import {EncodingShelf, EncodingShelfDispatchProps} from './EncodingShelf';
import {MarkShelf, MarkShelfDispatcher} from './MarkShelf';


interface EncodingPanelDispatchProps extends EncodingShelfDispatchProps, MarkShelfDispatcher {}

interface EncodingPanelProps extends EncodingPanelDispatchProps {
  shelf: UnitShelf;
}

class EncodingPanelBase extends React.Component<EncodingPanelProps, {}> {
  public render() {
    const positionShelves = ['x', 'y'].map(this.encodingShelf, this);
    const facetShelves = ['row', 'column'].map(this.encodingShelf, this);
    const otherShelves = ['size', 'color', 'shape', 'detail', 'text'].map(this.encodingShelf, this);

    return (
      <div className="shelf">
        <h2>Encoding</h2>
        {positionShelves}
        {facetShelves}

        <h3>Mark</h3>
        <MarkShelf
          mark={this.props.shelf.mark}
          onMarkChange={this.props.onMarkChange}
        />

        {otherShelves}
      </div>
    );
  }

  /**
   * Return encoding shelf for normal (non-wildcard channels).
   */
  private encodingShelf(channel: Channel) {
    // This one can't be wildcard, thus we use VL's Channel, not our ShelfChannel

    const {encoding} = this.props.shelf;
    const {onFieldDrop, onFieldRemove} = this.props;

    // HACK: add alias to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
    const EShelf = EncodingShelf as any;

    return (
      <EShelf
        key={channel}
        channel={channel}
        fieldDef={encoding[channel]}
        onFieldDrop={onFieldDrop}
        onFieldRemove={onFieldRemove}
      />
    );
  }
}


export const EncodingPanel = connect(
  (state: State) => {
    // FIXME use reselect
    return {shelf: state.shelf};
  },
  (dispatch): EncodingPanelDispatchProps => {
    return {
      onMarkChange(mark: Mark) {
        dispatch({
          type: SHELF_MARK_CHANGE_TYPE,
          payload: mark
        });
      },
      onFieldDrop(channel: Channel, fieldDef: ShelfFieldDef, index?: number) {
        dispatch({
          type: SHELF_FIELD_ADD,
          payload: {channel, fieldDef, index}
        });
      },

      onFieldRemove(channel, index?) {
        dispatch({
          type: SHELF_FIELD_REMOVE,
          payload: {channel, index}
        });
      }
    };
  }
)(EncodingPanelBase);