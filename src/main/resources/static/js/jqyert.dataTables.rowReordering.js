/*!
 RowReorder 1.2.5
 2015-2018 SpryMedia Ltd - datatables.net/license
*/
(function(d) {
    "function" === typeof define && define.amd ? define(["jquery", "datatables.net"], function(f) {
        return d(f, window, document)
    }) : "object" === typeof exports ? module.exports = function(f, g) {
        f || (f = window);
        if (!g || !g.fn.dataTable) g = require("datatables.net")(f, g).$;
        return d(g, f, f.document)
    } : d(jQuery, window, document)
})(function(d, f, g, m) {
    var h = d.fn.dataTable,
        k = function(c, b) {
            if (!h.versionCheck || !h.versionCheck("1.10.8")) throw "DataTables RowReorder requires DataTables 1.10.8 or newer";
            this.c = d.extend(!0, {}, h.defaults.rowReorder,
                k.defaults, b);
            this.s = {
                bodyTop: null,
                dt: new h.Api(c),
                getDataFn: h.ext.oApi._fnGetObjectDataFn(this.c.dataSrc),
                middles: null,
                scroll: {},
                scrollInterval: null,
                setDataFn: h.ext.oApi._fnSetObjectDataFn(this.c.dataSrc),
                start: {
                    top: 0,
                    left: 0,
                    offsetTop: 0,
                    offsetLeft: 0,
                    nodes: []
                },
                windowHeight: 0,
                documentOuterHeight: 0,
                domCloneOuterHeight: 0
            };
            this.dom = {
                clone: null,
                dtScroll: d("div.dataTables_scrollBody", this.s.dt.table().container())
            };
            var a = this.s.dt.settings()[0],
                e = a.rowreorder;
            if (e) return e;
            a.rowreorder = this;
            this._constructor()
        };
    d.extend(k.prototype, {
        _constructor: function() {
            var c = this,
                b = this.s.dt,
                a = d(b.table().node());
            "static" === a.css("position") && a.css("position", "relative");
            d(b.table().container()).on("mousedown.rowReorder touchstart.rowReorder", this.c.selector, function(a) {
                if (c.c.enable) {
                    if (d(a.target).is(c.c.excludedChildren)) return !0;
                    var i = d(this).closest("tr"),
                        j = b.row(i);
                    if (j.any()) return c._emitEvent("pre-row-reorder", {
                        node: j.node(),
                        index: j.index()
                    }), c._mouseDown(a, i), !1
                }
            });
            b.on("destroy.rowReorder", function() {
                d(b.table().container()).off(".rowReorder");
                b.off(".rowReorder")
            })
        },
        _cachePositions: function() {
            var c = this.s.dt,
                b = d(c.table().node()).find("thead").outerHeight(),
                a = d.unique(c.rows({
                    page: "current"
                }).nodes().toArray()),
                e = d.map(a, function(a) {
                    return d(a).position().top - b
                }),
                a = d.map(e, function(a, b) {
                    return e.length < b - 1 ? (a + e[b + 1]) / 2 : (a + a + d(c.row(":last-child").node()).outerHeight()) / 2
                });
            this.s.middles = a;
            this.s.bodyTop = d(c.table().body()).offset().top;
            this.s.windowHeight = d(f).height();
            this.s.documentOuterHeight = d(g).outerHeight()
        },
        _clone: function(c) {
            var b =
                d(this.s.dt.table().node().cloneNode(!1)).addClass("dt-rowReorder-float").append("<tbody/>").append(c.clone(!1)),
                a = c.outerWidth(),
                e = c.outerHeight(),
                i = c.children().map(function() {
                    return d(this).width()
                });
            b.width(a).height(e).find("tr").children().each(function(a) {
                this.style.width = i[a] + "px"
            });
            b.appendTo("body");
            this.dom.clone = b;
            this.s.domCloneOuterHeight = b.outerHeight()
        },
        _clonePosition: function(c) {
            var b = this.s.start,
                a = this._eventToPage(c, "Y") - b.top,
                c = this._eventToPage(c, "X") - b.left,
                e = this.c.snapX,
                a =
                a + b.offsetTop,
                b = !0 === e ? b.offsetLeft : "number" === typeof e ? b.offsetLeft + e : c + b.offsetLeft;
            0 > a ? a = 0 : a + this.s.domCloneOuterHeight > this.s.documentOuterHeight && (a = this.s.documentOuterHeight - this.s.domCloneOuterHeight);
            this.dom.clone.css({
                top: a,
                left: b
            })
        },
        _emitEvent: function(c, b) {
            this.s.dt.iterator("table", function(a) {
                d(a.nTable).triggerHandler(c + ".dt", b)
            })
        },
        _eventToPage: function(c, b) {
            return -1 !== c.type.indexOf("touch") ? c.originalEvent.touches[0]["page" + b] : c["page" + b]
        },
        _mouseDown: function(c, b) {
            var a = this,
                e = this.s.dt,
                i = this.s.start,
                j = b.offset();
            i.top = this._eventToPage(c, "Y");
            i.left = this._eventToPage(c, "X");
            i.offsetTop = j.top;
            i.offsetLeft = j.left;
            i.nodes = d.unique(e.rows({
                page: "current"
            }).nodes().toArray());
            this._cachePositions();
            this._clone(b);
            this._clonePosition(c);
            this.dom.target = b;
            b.addClass("dt-rowReorder-moving");
            d(g).on("mouseup.rowReorder touchend.rowReorder", function(b) {
                a._mouseUp(b)
            }).on("mousemove.rowReorder touchmove.rowReorder", function(b) {
                a._mouseMove(b)
            });
            d(f).width() === d(g).width() && d(g.body).addClass("dt-rowReorder-noOverflow");
            e = this.dom.dtScroll;
            this.s.scroll = {
                windowHeight: d(f).height(),
                windowWidth: d(f).width(),
                dtTop: e.length ? e.offset().top : null,
                dtLeft: e.length ? e.offset().left : null,
                dtHeight: e.length ? e.outerHeight() : null,
                dtWidth: e.length ? e.outerWidth() : null
            }
        },
        _mouseMove: function(c) {
            this._clonePosition(c);
            for (var b = this._eventToPage(c, "Y") - this.s.bodyTop, a = this.s.middles, e = null, i = this.s.dt, j = i.table().body(), g = 0, f = a.length; g < f; g++)
                if (b < a[g]) {
                    e = g;
                    break
                }
            null === e && (e = a.length);
            if (null === this.s.lastInsert || this.s.lastInsert !==
                e) 0 === e ? this.dom.target.prependTo(j) : (b = d.unique(i.rows({
                page: "current"
            }).nodes().toArray()), e > this.s.lastInsert ? this.dom.target.insertAfter(b[e - 1]) : this.dom.target.insertBefore(b[e])), this._cachePositions(), this.s.lastInsert = e;
            this._shiftScroll(c)
        },
        _mouseUp: function() {
            var c = this,
                b = this.s.dt,
                a, e, i = this.c.dataSrc;
            this.dom.clone.remove();
            this.dom.clone = null;
            this.dom.target.removeClass("dt-rowReorder-moving");
            d(g).off(".rowReorder");
            d(g.body).removeClass("dt-rowReorder-noOverflow");
            clearInterval(this.s.scrollInterval);
            this.s.scrollInterval = null;
            var j = this.s.start.nodes,
                f = d.unique(b.rows({
                    page: "current"
                }).nodes().toArray()),
                k = {},
                h = [],
                l = [],
                n = this.s.getDataFn,
                m = this.s.setDataFn;
            a = 0;
            for (e = j.length; a < e; a++)
                if (j[a] !== f[a]) {
                    var o = b.row(f[a]).id(),
                        s = b.row(f[a]).data(),
                        p = b.row(j[a]).data();
                    o && (k[o] = n(p));
                    h.push({
                        node: f[a],
                        oldData: n(s),
                        newData: n(p),
                        newPosition: a,
                        oldPosition: d.inArray(f[a], j)
                    });
                    l.push(f[a])
                }
            var q = [h, {
                dataSrc: i,
                nodes: l,
                values: k,
                triggerRow: b.row(this.dom.target)
            }];
            this._emitEvent("row-reorder", q);
            var r = function() {
                if (c.c.update) {
                    a =
                        0;
                    for (e = h.length; a < e; a++) {
                        var d = b.row(h[a].node).data();
                        m(d, h[a].newData);
                        b.columns().every(function() {
                            this.dataSrc() === i && b.cell(h[a].node, this.index()).invalidate("data")
                        })
                    }
                    c._emitEvent("row-reordered", q);
                    b.draw(!1)
                }
            };
            this.c.editor ? (this.c.enable = !1, this.c.editor.edit(l, !1, d.extend({
                submit: "changed"
            }, this.c.formOptions)).multiSet(i, k).one("preSubmitCancelled.rowReorder", function() {
                c.c.enable = !0;
                c.c.editor.off(".rowReorder");
                b.draw(!1)
            }).one("submitUnsuccessful.rowReorder", function() {
                b.draw(!1)
            }).one("submitSuccess.rowReorder",
                function() {
                    r()
                }).one("submitComplete", function() {
                c.c.enable = !0;
                c.c.editor.off(".rowReorder")
            }).submit()) : r()
        },
        _shiftScroll: function(c) {
            var b = this,
                a = this.s.scroll,
                e = !1,
                d = c.pageY - g.body.scrollTop,
                f, h;
            65 > d ? f = -5 : d > a.windowHeight - 65 && (f = 5);
            null !== a.dtTop && c.pageY < a.dtTop + 65 ? h = -5 : null !== a.dtTop && c.pageY > a.dtTop + a.dtHeight - 65 && (h = 5);
            f || h ? (a.windowVert = f, a.dtVert = h, e = !0) : this.s.scrollInterval && (clearInterval(this.s.scrollInterval), this.s.scrollInterval = null);
            !this.s.scrollInterval && e && (this.s.scrollInterval =
                setInterval(function() {
                    if (a.windowVert) g.body.scrollTop = g.body.scrollTop + a.windowVert;
                    if (a.dtVert) {
                        var c = b.dom.dtScroll[0];
                        if (a.dtVert) c.scrollTop = c.scrollTop + a.dtVert
                    }
                }, 20))
        }
    });
    k.defaults = {
        dataSrc: 0,
        editor: null,
        enable: !0,
        formOptions: {},
        selector: "td:first-child",
        snapX: !1,
        update: !0,
        excludedChildren: "a"
    };
    var l = d.fn.dataTable.Api;
    l.register("rowReorder()", function() {
        return this
    });
    l.register("rowReorder.enable()", function(c) {
        c === m && (c = !0);
        return this.iterator("table", function(b) {
            b.rowreorder && (b.rowreorder.c.enable =
                c)
        })
    });
    l.register("rowReorder.disable()", function() {
        return this.iterator("table", function(c) {
            c.rowreorder && (c.rowreorder.c.enable = !1)
        })
    });
    k.version = "1.2.5";
    d.fn.dataTable.RowReorder = k;
    d.fn.DataTable.RowReorder = k;
    d(g).on("init.dt.dtr", function(c, b) {
        if ("dt" === c.namespace) {
            var a = b.oInit.rowReorder,
                e = h.defaults.rowReorder;
            if (a || e) e = d.extend({}, a, e), !1 !== a && new k(b, e)
        }
    });
    return k
});