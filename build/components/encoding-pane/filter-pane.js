"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var wildcard_1 = require("compassql/build/src/wildcard");
var React = require("react");
var CSSModules = require("react-css-modules");
var react_dnd_1 = require("react-dnd");
var filter_1 = require("vega-lite/build/src/filter");
var timeunit_1 = require("vega-lite/build/src/timeunit");
var filter_2 = require("../../actions/filter");
var constants_1 = require("../../constants");
var filter_3 = require("../../models/shelf/filter");
var index_1 = require("../field/index");
var styles = require("./filter-pane.scss");
var function_picker_1 = require("./function-picker");
var one_of_filter_shelf_1 = require("./one-of-filter-shelf");
var range_filter_shelf_1 = require("./range-filter-shelf");
;
var FilterPaneBase = (function (_super) {
    __extends(FilterPaneBase, _super);
    function FilterPaneBase(props) {
        var _this = _super.call(this, props) || this;
        _this.filterModifyTimeUnit = _this.filterModifyTimeUnit.bind(_this);
        return _this;
    }
    FilterPaneBase.prototype.render = function () {
        var _this = this;
        var _a = this.props, filters = _a.filters, connectDropTarget = _a.connectDropTarget;
        var filterShelves = filters.map(function (filter, index) {
            return _this.renderFilterShelf(filter, index);
        });
        return connectDropTarget(React.createElement("div", null,
            filterShelves,
            this.fieldPlaceholder()));
    };
    FilterPaneBase.prototype.filterRemove = function (index) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: filter_2.FILTER_REMOVE,
            payload: {
                index: index
            }
        });
    };
    FilterPaneBase.prototype.filterModifyTimeUnit = function (timeUnit, index) {
        var handleAction = this.props.handleAction;
        if (timeUnit === '-') {
            timeUnit = undefined;
        }
        handleAction({
            type: filter_2.FILTER_MODIFY_TIME_UNIT,
            payload: {
                index: index,
                timeUnit: timeUnit
            }
        });
    };
    FilterPaneBase.prototype.renderFilterShelf = function (filter, index) {
        var _this = this;
        var _a = this.props, handleAction = _a.handleAction, schema = _a.schema;
        var domain = schema.domain({ field: filter.field });
        var fieldSchema = schema.fieldSchema(filter.field);
        var fieldDef = {
            field: fieldSchema.name,
            type: fieldSchema.vlType
        };
        var onFunctionChange = function (timeUnit) {
            _this.filterModifyTimeUnit(timeUnit, index);
        };
        var popupComponent = fieldDef.type === expandedtype_1.ExpandedType.TEMPORAL &&
            React.createElement(function_picker_1.FunctionPicker, { fieldDefParts: {
                    fn: filter.timeUnit,
                    type: expandedtype_1.ExpandedType.TEMPORAL
                }, onFunctionChange: onFunctionChange });
        var filterComponent;
        var timeUnit = filter.timeUnit;
        if (filter_1.isRangeFilter(filter)) {
            if (fieldDef.type === expandedtype_1.ExpandedType.TEMPORAL) {
                if (timeUnit) {
                    domain = filter_3.getDefaultRange(domain, timeUnit);
                }
                else {
                    // schema.domain returns Date[] for temporal type, we need to convert it to DateTime[]
                    domain = [filter_3.convertToDateTimeObject(Number(domain[0])), filter_3.convertToDateTimeObject(Number(domain[1]))];
                }
            }
            filterComponent = (React.createElement(range_filter_shelf_1.RangeFilterShelf, { domain: domain, filter: filter, index: index, renderDateTimePicker: this.renderDateTimePicker(fieldDef.type, filter.timeUnit), handleAction: handleAction }));
        }
        else if (filter_1.isOneOfFilter(filter)) {
            if (timeUnit) {
                domain = filter_3.getDefaultList(timeUnit);
            }
            filterComponent = (React.createElement(one_of_filter_shelf_1.OneOfFilterShelf, { domain: domain, index: index, filter: filter, handleAction: handleAction }));
        }
        return (React.createElement("div", { styleName: 'filter-shelf', key: index },
            React.createElement(index_1.Field, { draggable: false, fieldDef: fieldDef, caretShow: true, filterShow: false, isPill: true, onRemove: this.filterRemove.bind(this, index), popupComponent: popupComponent, handleAction: handleAction }),
            filterComponent));
    };
    FilterPaneBase.prototype.fieldPlaceholder = function () {
        var _a = this.props, item = _a.item, isOver = _a.isOver, canDrop = _a.canDrop;
        var styleName, text;
        if (item && !canDrop) {
            styleName = 'placeholder-disabled';
            text = 'Cannot drop a field here';
        }
        else {
            styleName = isOver ? 'placeholder-over' : item ? 'placeholder-active' : 'placeholder';
            text = 'Drop a field here';
        }
        return (React.createElement("span", { styleName: styleName }, text));
    };
    /**
     * returns whether we should render date time picker instead of normal number input
     */
    FilterPaneBase.prototype.renderDateTimePicker = function (type, timeUnit) {
        if (!timeUnit) {
            if (type === expandedtype_1.ExpandedType.QUANTITATIVE) {
                return false;
            }
            else if (type === expandedtype_1.ExpandedType.TEMPORAL) {
                return true;
            }
        }
        switch (timeUnit) {
            case timeunit_1.TimeUnit.YEAR:
            case timeunit_1.TimeUnit.MONTH:
            case timeunit_1.TimeUnit.DAY:
            case timeunit_1.TimeUnit.DATE:
            case timeunit_1.TimeUnit.HOURS:
            case timeunit_1.TimeUnit.MINUTES:
            case timeunit_1.TimeUnit.SECONDS:
            case timeunit_1.TimeUnit.MILLISECONDS:
                return false;
            case timeunit_1.TimeUnit.YEARMONTHDATE:
                return true;
            default:
                throw new Error(timeUnit + ' is not supported');
        }
    };
    return FilterPaneBase;
}(React.PureComponent));
var filterShelfTarget = {
    drop: function (props, monitor) {
        if (monitor.didDrop()) {
            return;
        }
        var filter = monitor.getItem().filter;
        if (wildcard_1.isWildcard(filter.field)) {
            throw new Error('Cannot add wildcard filter');
        }
        props.handleAction({
            type: filter_2.FILTER_ADD,
            payload: {
                filter: filter
            }
        });
    },
    canDrop: function (props, monitor) {
        var fieldDef = monitor.getItem().fieldDef;
        return !wildcard_1.isWildcard(fieldDef.field) && fieldDef.field !== '*';
    }
};
var collect = function (connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        item: monitor.getItem(),
        canDrop: monitor.canDrop()
    };
};
// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
exports.FilterPane = react_dnd_1.DropTarget(constants_1.DraggableType.FIELD, filterShelfTarget, collect)(CSSModules(FilterPaneBase, styles));
