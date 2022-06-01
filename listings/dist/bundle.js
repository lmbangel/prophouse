
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ListingsCollection = factory());
})(this, (function () { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false }) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function paginate ({ items, pageSize, currentPage }) {
      return items
        .slice(
          (currentPage - 1) * pageSize,
          (currentPage - 1) * pageSize + pageSize
        )
    }

    const PREVIOUS_PAGE = 'PREVIOUS_PAGE';
    const NEXT_PAGE = 'NEXT_PAGE';
    const ELLIPSIS = 'ELLIPSIS';

    function generateNavigationOptions ({ totalItems, pageSize, currentPage, limit = null, showStepOptions = false })  {
      const totalPages = Math.ceil(totalItems / pageSize);
      const limitThreshold = getLimitThreshold({ limit });
      const limited = limit && totalPages > limitThreshold;
      let options = limited
        ? generateLimitedOptions({ totalPages, limit, currentPage })
        : generateUnlimitedOptions({ totalPages });
      return showStepOptions
        ? addStepOptions({ options, currentPage, totalPages })
        : options
    }

    function generateUnlimitedOptions ({ totalPages }) {
      return new Array(totalPages)
        .fill(null)
        .map((value, index) => ({
          type: 'number',
          value: index + 1
        }))
    }

    function generateLimitedOptions ({ totalPages, limit, currentPage }) {
      const boundarySize = limit * 2 + 2;
      const firstBoundary = 1 + boundarySize;
      const lastBoundary = totalPages - boundarySize;
      const totalShownPages = firstBoundary + 2;

      if (currentPage <= firstBoundary - limit) {
        return Array(totalShownPages)
          .fill(null)
          .map((value, index) => {
            if (index === totalShownPages - 1) {
              return {
                type: 'number',
                value: totalPages
              }
            } else if (index === totalShownPages - 2) {
              return {
                type: 'symbol',
                symbol: ELLIPSIS,
                value: firstBoundary + 1
              }
            }
            return {
              type: 'number',
              value: index + 1
            }
          })
      } else if (currentPage >= lastBoundary + limit) {
        return Array(totalShownPages)
          .fill(null)
          .map((value, index) => {
            if (index === 0) {
              return {
                type: 'number',
                value: 1
              }
            } else if (index === 1) {
              return {
                type: 'symbol',
                symbol: ELLIPSIS,
                value: lastBoundary - 1
              }
            }
            return {
              type: 'number',
              value: lastBoundary + index - 2
            }
          })
      } else if (currentPage >= (firstBoundary - limit) && currentPage <= (lastBoundary + limit)) {
        return Array(totalShownPages)
          .fill(null)
          .map((value, index) => {
            if (index === 0) {
              return {
                type: 'number',
                value: 1
              }
            } else if (index === 1) {
              return {
                type: 'symbol',
                symbol: ELLIPSIS,
                value: currentPage - limit + (index - 2)
              }
            } else if (index === totalShownPages - 1) {
              return {
                type: 'number',
                value: totalPages
              }
            } else if (index === totalShownPages - 2) {
              return {
                type: 'symbol',
                symbol: ELLIPSIS,
                value: currentPage + limit + 1
              }
            }
            return {
              type: 'number',
              value: currentPage - limit + (index - 2)
            }
          })
      }
    }

    function addStepOptions ({ options, currentPage, totalPages }) {
      return [
        {
          type: 'symbol',
          symbol: PREVIOUS_PAGE,
          value: currentPage <= 1 ? 1 : currentPage - 1
        },
        ...options,
        {
          type: 'symbol',
          symbol: NEXT_PAGE,
          value: currentPage >= totalPages ? totalPages : currentPage + 1
        }
      ]
    }

    function getLimitThreshold ({ limit }) {
      const maximumUnlimitedPages = 3; // This means we cannot limit 3 pages or less
      const numberOfBoundaryPages = 2; // The first and last pages are always shown
      return limit * 2 + maximumUnlimitedPages + numberOfBoundaryPages
    }

    /* node_modules\svelte-paginate\src\PaginationNav.svelte generated by Svelte v3.48.0 */
    const file$2 = "node_modules\\svelte-paginate\\src\\PaginationNav.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    const get_next_slot_changes = dirty => ({});
    const get_next_slot_context = ctx => ({});
    const get_prev_slot_changes = dirty => ({});
    const get_prev_slot_context = ctx => ({});
    const get_ellipsis_slot_changes = dirty => ({});
    const get_ellipsis_slot_context = ctx => ({});
    const get_number_slot_changes = dirty => ({ value: dirty & /*options*/ 4 });
    const get_number_slot_context = ctx => ({ value: /*option*/ ctx[12].value });

    // (68:72) 
    function create_if_block_3(ctx) {
    	let current;
    	const next_slot_template = /*#slots*/ ctx[9].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[8], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						next_slot,
    						next_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(next_slot_template, /*$$scope*/ ctx[8], dirty, get_next_slot_changes),
    						get_next_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(68:72) ",
    		ctx
    	});

    	return block;
    }

    // (56:76) 
    function create_if_block_2$1(ctx) {
    	let current;
    	const prev_slot_template = /*#slots*/ ctx[9].prev;
    	const prev_slot = create_slot(prev_slot_template, ctx, /*$$scope*/ ctx[8], get_prev_slot_context);
    	const prev_slot_or_fallback = prev_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (prev_slot_or_fallback) prev_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (prev_slot_or_fallback) {
    				prev_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prev_slot) {
    				if (prev_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						prev_slot,
    						prev_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(prev_slot_template, /*$$scope*/ ctx[8], dirty, get_prev_slot_changes),
    						get_prev_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prev_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prev_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prev_slot_or_fallback) prev_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(56:76) ",
    		ctx
    	});

    	return block;
    }

    // (52:71) 
    function create_if_block_1$1(ctx) {
    	let current;
    	const ellipsis_slot_template = /*#slots*/ ctx[9].ellipsis;
    	const ellipsis_slot = create_slot(ellipsis_slot_template, ctx, /*$$scope*/ ctx[8], get_ellipsis_slot_context);
    	const ellipsis_slot_or_fallback = ellipsis_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (ellipsis_slot_or_fallback) ellipsis_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (ellipsis_slot_or_fallback) {
    				ellipsis_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (ellipsis_slot) {
    				if (ellipsis_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						ellipsis_slot,
    						ellipsis_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(ellipsis_slot_template, /*$$scope*/ ctx[8], dirty, get_ellipsis_slot_changes),
    						get_ellipsis_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ellipsis_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ellipsis_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (ellipsis_slot_or_fallback) ellipsis_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(52:71) ",
    		ctx
    	});

    	return block;
    }

    // (48:6) {#if option.type === 'number'}
    function create_if_block$1(ctx) {
    	let current;
    	const number_slot_template = /*#slots*/ ctx[9].number;
    	const number_slot = create_slot(number_slot_template, ctx, /*$$scope*/ ctx[8], get_number_slot_context);
    	const number_slot_or_fallback = number_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (number_slot_or_fallback) number_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (number_slot_or_fallback) {
    				number_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (number_slot) {
    				if (number_slot.p && (!current || dirty & /*$$scope, options*/ 260)) {
    					update_slot_base(
    						number_slot,
    						number_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(number_slot_template, /*$$scope*/ ctx[8], dirty, get_number_slot_changes),
    						get_number_slot_context
    					);
    				}
    			} else {
    				if (number_slot_or_fallback && number_slot_or_fallback.p && (!current || dirty & /*options*/ 4)) {
    					number_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (number_slot_or_fallback) number_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(48:6) {#if option.type === 'number'}",
    		ctx
    	});

    	return block;
    }

    // (69:26)            
    function fallback_block_3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#000000");
    			attr_dev(path, "d", "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z");
    			add_location(path, file$2, 73, 12, 2306);
    			set_style(svg, "width", "24px");
    			set_style(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$2, 69, 10, 2202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_3.name,
    		type: "fallback",
    		source: "(69:26)            ",
    		ctx
    	});

    	return block;
    }

    // (57:26)            
    function fallback_block_2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#000000");
    			attr_dev(path, "d", "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z");
    			add_location(path, file$2, 61, 12, 1929);
    			set_style(svg, "width", "24px");
    			set_style(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$2, 57, 10, 1825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(57:26)            ",
    		ctx
    	});

    	return block;
    }

    // (53:30)            
    function fallback_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "...";
    			add_location(span, file$2, 53, 10, 1678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(53:30)            ",
    		ctx
    	});

    	return block;
    }

    // (49:51)            
    function fallback_block(ctx) {
    	let span;
    	let t_value = /*option*/ ctx[12].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$2, 49, 10, 1521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 4 && t_value !== (t_value = /*option*/ ctx[12].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(49:51)            ",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#each options as option}
    function create_each_block$1(ctx) {
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2$1, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[12].type === 'number') return 0;
    		if (/*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === ELLIPSIS) return 1;
    		if (/*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE) return 2;
    		if (/*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*option*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(span, "class", "option");
    			toggle_class(span, "number", /*option*/ ctx[12].type === 'number');
    			toggle_class(span, "prev", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE);
    			toggle_class(span, "next", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE);
    			toggle_class(span, "disabled", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE && /*currentPage*/ ctx[0] >= /*totalPages*/ ctx[1] || /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE && /*currentPage*/ ctx[0] <= 1);
    			toggle_class(span, "ellipsis", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === ELLIPSIS);
    			toggle_class(span, "active", /*option*/ ctx[12].type === 'number' && /*option*/ ctx[12].value === /*currentPage*/ ctx[0]);
    			add_location(span, file$2, 34, 4, 751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(span, null);
    			}

    			append_dev(span, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(span, t);
    				} else {
    					if_block = null;
    				}
    			}

    			if (dirty & /*options*/ 4) {
    				toggle_class(span, "number", /*option*/ ctx[12].type === 'number');
    			}

    			if (dirty & /*options, PREVIOUS_PAGE*/ 4) {
    				toggle_class(span, "prev", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE);
    			}

    			if (dirty & /*options, NEXT_PAGE*/ 4) {
    				toggle_class(span, "next", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE);
    			}

    			if (dirty & /*options, NEXT_PAGE, currentPage, totalPages, PREVIOUS_PAGE*/ 7) {
    				toggle_class(span, "disabled", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE && /*currentPage*/ ctx[0] >= /*totalPages*/ ctx[1] || /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE && /*currentPage*/ ctx[0] <= 1);
    			}

    			if (dirty & /*options, ELLIPSIS*/ 4) {
    				toggle_class(span, "ellipsis", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === ELLIPSIS);
    			}

    			if (dirty & /*options, currentPage*/ 5) {
    				toggle_class(span, "active", /*option*/ ctx[12].type === 'number' && /*option*/ ctx[12].value === /*currentPage*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(34:2) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let each_value = /*options*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pagination-nav");
    			add_location(div, file$2, 32, 0, 690);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*options, PREVIOUS_PAGE, NEXT_PAGE, currentPage, totalPages, ELLIPSIS, handleOptionClick, $$scope*/ 271) {
    				each_value = /*options*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let options;
    	let totalPages;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PaginationNav', slots, ['number','ellipsis','prev','next']);
    	const dispatch = createEventDispatcher();
    	let { totalItems = 0 } = $$props;
    	let { pageSize = 1 } = $$props;
    	let { currentPage = 1 } = $$props;
    	let { limit = null } = $$props;
    	let { showStepOptions = false } = $$props;

    	function handleOptionClick(option) {
    		dispatch('setPage', { page: option.value });
    	}

    	const writable_props = ['totalItems', 'pageSize', 'currentPage', 'limit', 'showStepOptions'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PaginationNav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = option => handleOptionClick(option);

    	$$self.$$set = $$props => {
    		if ('totalItems' in $$props) $$invalidate(4, totalItems = $$props.totalItems);
    		if ('pageSize' in $$props) $$invalidate(5, pageSize = $$props.pageSize);
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('limit' in $$props) $$invalidate(6, limit = $$props.limit);
    		if ('showStepOptions' in $$props) $$invalidate(7, showStepOptions = $$props.showStepOptions);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		generateNavigationOptions,
    		PREVIOUS_PAGE,
    		NEXT_PAGE,
    		ELLIPSIS,
    		dispatch,
    		totalItems,
    		pageSize,
    		currentPage,
    		limit,
    		showStepOptions,
    		handleOptionClick,
    		totalPages,
    		options
    	});

    	$$self.$inject_state = $$props => {
    		if ('totalItems' in $$props) $$invalidate(4, totalItems = $$props.totalItems);
    		if ('pageSize' in $$props) $$invalidate(5, pageSize = $$props.pageSize);
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('limit' in $$props) $$invalidate(6, limit = $$props.limit);
    		if ('showStepOptions' in $$props) $$invalidate(7, showStepOptions = $$props.showStepOptions);
    		if ('totalPages' in $$props) $$invalidate(1, totalPages = $$props.totalPages);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*totalItems, pageSize, currentPage, limit, showStepOptions*/ 241) {
    			$$invalidate(2, options = generateNavigationOptions({
    				totalItems,
    				pageSize,
    				currentPage,
    				limit,
    				showStepOptions
    			}));
    		}

    		if ($$self.$$.dirty & /*totalItems, pageSize*/ 48) {
    			$$invalidate(1, totalPages = Math.ceil(totalItems / pageSize));
    		}
    	};

    	return [
    		currentPage,
    		totalPages,
    		options,
    		handleOptionClick,
    		totalItems,
    		pageSize,
    		limit,
    		showStepOptions,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class PaginationNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			totalItems: 4,
    			pageSize: 5,
    			currentPage: 0,
    			limit: 6,
    			showStepOptions: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaginationNav",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get totalItems() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalItems(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pageSize() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pageSize(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentPage() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentPage(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get limit() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set limit(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showStepOptions() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showStepOptions(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-paginate\src\LightPaginationNav.svelte generated by Svelte v3.48.0 */
    const file$1 = "node_modules\\svelte-paginate\\src\\LightPaginationNav.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let paginationnav;
    	let current;
    	const paginationnav_spread_levels = [/*$$props*/ ctx[0]];
    	let paginationnav_props = {};

    	for (let i = 0; i < paginationnav_spread_levels.length; i += 1) {
    		paginationnav_props = assign(paginationnav_props, paginationnav_spread_levels[i]);
    	}

    	paginationnav = new PaginationNav({
    			props: paginationnav_props,
    			$$inline: true
    		});

    	paginationnav.$on("setPage", /*setPage_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(paginationnav.$$.fragment);
    			attr_dev(div, "class", "light-pagination-nav svelte-s5ru8s");
    			add_location(div, file$1, 4, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(paginationnav, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const paginationnav_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(paginationnav_spread_levels, [get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			paginationnav.$set(paginationnav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationnav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationnav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(paginationnav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LightPaginationNav', slots, []);

    	function setPage_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ PaginationNav });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, setPage_handler];
    }

    class LightPaginationNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightPaginationNav",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\ListingsCollection.svelte generated by Svelte v3.48.0 */
    const file = "src\\ListingsCollection.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (22:4) {#if  (listing.bedrooms > 0) && (listing.bedrooms != null) }
    function create_if_block_2(ctx) {
    	let i;
    	let span;
    	let t_value = /*listing*/ ctx[6].bedrooms + "";
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(i, "class", "fa fa-bed text-gray-600 mx-1");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file, 22, 5, 1338);
    			attr_dev(span, "class", "mx-1 text-gray-600");
    			add_location(span, file, 22, 68, 1401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*paginatedItems*/ 2 && t_value !== (t_value = /*listing*/ ctx[6].bedrooms + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(22:4) {#if  (listing.bedrooms > 0) && (listing.bedrooms != null) }",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#if  (listing.bathrooms > 0) && (listing.bathrooms != null) }
    function create_if_block_1(ctx) {
    	let i;
    	let span;
    	let t_value = /*listing*/ ctx[6].bathrooms + "";
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(i, "class", "fa fa-bath text-gray-600 mx-1");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file, 25, 5, 1542);
    			attr_dev(span, "class", "mx-1 text-gray-600");
    			add_location(span, file, 25, 69, 1606);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*paginatedItems*/ 2 && t_value !== (t_value = /*listing*/ ctx[6].bathrooms + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(25:4) {#if  (listing.bathrooms > 0) && (listing.bathrooms != null) }",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if  (listing.garages > 0) && (listing.garages != null) }
    function create_if_block(ctx) {
    	let i;
    	let span;
    	let t_value = /*listing*/ ctx[6].garages + "";
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(i, "class", "fa fa-car text-gray-600 mx-1");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file, 28, 5, 1744);
    			attr_dev(span, "class", "mx-1 text-gray-600");
    			add_location(span, file, 28, 68, 1807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*paginatedItems*/ 2 && t_value !== (t_value = /*listing*/ ctx[6].garages + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:4) {#if  (listing.garages > 0) && (listing.garages != null) }",
    		ctx
    	});

    	return block;
    }

    // (13:0) {#each paginatedItems as listing}
    function create_each_block(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div;
    	let h5;
    	let t1;
    	let t2_value = /*listing*/ ctx[6].marketing_list_price.toLocaleString(undefined, { minimumFractionDigits: 2 }) + "";
    	let t2;
    	let t3;
    	let h3;

    	let t4_value = (/*listing*/ ctx[6].suburb
    	? /*listing*/ ctx[6].suburb
    	: /*listing*/ ctx[6].city) + "";

    	let t4;
    	let t5;
    	let p0;
    	let t6_value = /*listing*/ ctx[6].marketing_listing_heading + "";
    	let t6;
    	let t7;
    	let p1;
    	let t8;
    	let t9;
    	let a_href_value;
    	let if_block0 = /*listing*/ ctx[6].bedrooms > 0 && /*listing*/ ctx[6].bedrooms != null && create_if_block_2(ctx);
    	let if_block1 = /*listing*/ ctx[6].bathrooms > 0 && /*listing*/ ctx[6].bathrooms != null && create_if_block_1(ctx);
    	let if_block2 = /*listing*/ ctx[6].garages > 0 && /*listing*/ ctx[6].garages != null && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div = element("div");
    			h5 = element("h5");
    			t1 = text("R ");
    			t2 = text(t2_value);
    			t3 = space();
    			h3 = element("h3");
    			t4 = text(t4_value);
    			t5 = space();
    			p0 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			if (if_block0) if_block0.c();
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(img, "class", "object-cover w-full h-96 rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-l-lg");
    			if (!src_url_equal(img.src, img_src_value = "https://propertyhouseza.b-cdn.net/s_" + /*listing*/ ctx[6].displayimagefilepath)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*listing*/ ctx[6].address + " image"));
    			add_location(img, file, 15, 2, 595);
    			attr_dev(h5, "class", "mb-2 text-2xl font-bold tracking-tight text-sky-800 dark:text-white");
    			add_location(h5, file, 17, 3, 868);
    			attr_dev(h3, "class", "mb-3 font-bold text-gray-700 dark:text-gray-400");
    			add_location(h3, file, 18, 3, 1043);
    			attr_dev(p0, "class", "mb-3 font-normal text-gray-700 dark:text-gray-400");
    			add_location(p0, file, 19, 3, 1160);
    			add_location(p1, file, 20, 3, 1264);
    			attr_dev(div, "class", "flex flex-col justify-between p-4 leading-normal");
    			add_location(div, file, 16, 2, 802);
    			attr_dev(a, "href", a_href_value = "/prophouse/listing_view/" + /*listing*/ ctx[6].id);
    			attr_dev(a, "class", "flex flex-col md:w-6/12 items-center my-1 bg-white rounded-lg border shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700");
    			add_location(a, file, 14, 1, 355);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    			append_dev(a, t0);
    			append_dev(a, div);
    			append_dev(div, h5);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    			append_dev(div, t3);
    			append_dev(div, h3);
    			append_dev(h3, t4);
    			append_dev(div, t5);
    			append_dev(div, p0);
    			append_dev(p0, t6);
    			append_dev(div, t7);
    			append_dev(div, p1);
    			if (if_block0) if_block0.m(p1, null);
    			append_dev(p1, t8);
    			if (if_block1) if_block1.m(p1, null);
    			append_dev(p1, t9);
    			if (if_block2) if_block2.m(p1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*paginatedItems*/ 2 && !src_url_equal(img.src, img_src_value = "https://propertyhouseza.b-cdn.net/s_" + /*listing*/ ctx[6].displayimagefilepath)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*paginatedItems*/ 2 && img_alt_value !== (img_alt_value = "" + (/*listing*/ ctx[6].address + " image"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*paginatedItems*/ 2 && t2_value !== (t2_value = /*listing*/ ctx[6].marketing_list_price.toLocaleString(undefined, { minimumFractionDigits: 2 }) + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*paginatedItems*/ 2 && t4_value !== (t4_value = (/*listing*/ ctx[6].suburb
    			? /*listing*/ ctx[6].suburb
    			: /*listing*/ ctx[6].city) + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*paginatedItems*/ 2 && t6_value !== (t6_value = /*listing*/ ctx[6].marketing_listing_heading + "")) set_data_dev(t6, t6_value);

    			if (/*listing*/ ctx[6].bedrooms > 0 && /*listing*/ ctx[6].bedrooms != null) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(p1, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*listing*/ ctx[6].bathrooms > 0 && /*listing*/ ctx[6].bathrooms != null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(p1, t9);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*listing*/ ctx[6].garages > 0 && /*listing*/ ctx[6].garages != null) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(p1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*paginatedItems*/ 2 && a_href_value !== (a_href_value = "/prophouse/listing_view/" + /*listing*/ ctx[6].id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:0) {#each paginatedItems as listing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let div;
    	let lightpaginationnav;
    	let current;
    	let each_value = /*paginatedItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	lightpaginationnav = new LightPaginationNav({
    			props: {
    				totalItems: /*items*/ ctx[2].length,
    				pageSize: /*pageSize*/ ctx[3],
    				currentPage: /*currentPage*/ ctx[0],
    				limit: 1,
    				showStepOptions: true
    			},
    			$$inline: true
    		});

    	lightpaginationnav.$on("setPage", /*setPage_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			create_component(lightpaginationnav.$$.fragment);
    			add_location(div, file, 36, 0, 1943);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(lightpaginationnav, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paginatedItems, undefined*/ 2) {
    				each_value = /*paginatedItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const lightpaginationnav_changes = {};
    			if (dirty & /*currentPage*/ 1) lightpaginationnav_changes.currentPage = /*currentPage*/ ctx[0];
    			lightpaginationnav.$set(lightpaginationnav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lightpaginationnav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lightpaginationnav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(lightpaginationnav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let paginatedItems;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListingsCollection', slots, []);
    	let { listings = [] } = $$props;
    	document.getElementById('listingsContainer').innerHTML = '';
    	let items = listings;
    	let currentPage = 1;
    	let pageSize = 5;
    	const writable_props = ['listings'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ListingsCollection> was created with unknown prop '${key}'`);
    	});

    	const setPage_handler = e => $$invalidate(0, currentPage = e.detail.page);

    	$$self.$$set = $$props => {
    		if ('listings' in $$props) $$invalidate(4, listings = $$props.listings);
    	};

    	$$self.$capture_state = () => ({
    		paginate,
    		LightPaginationNav,
    		listings,
    		items,
    		currentPage,
    		pageSize,
    		paginatedItems
    	});

    	$$self.$inject_state = $$props => {
    		if ('listings' in $$props) $$invalidate(4, listings = $$props.listings);
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('pageSize' in $$props) $$invalidate(3, pageSize = $$props.pageSize);
    		if ('paginatedItems' in $$props) $$invalidate(1, paginatedItems = $$props.paginatedItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentPage*/ 1) {
    			$$invalidate(1, paginatedItems = paginate({ items, pageSize, currentPage }));
    		}
    	};

    	return [currentPage, paginatedItems, items, pageSize, listings, setPage_handler];
    }

    class ListingsCollection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { listings: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListingsCollection",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get listings() {
    		throw new Error("<ListingsCollection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listings(value) {
    		throw new Error("<ListingsCollection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    return ListingsCollection;

}));
//# sourceMappingURL=bundle.js.map
