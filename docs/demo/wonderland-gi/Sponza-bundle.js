var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// node_modules/earcut/src/earcut.js
var require_earcut = __commonJS({
  "node_modules/earcut/src/earcut.js"(exports, module) {
    "use strict";
    module.exports = earcut2;
    module.exports.default = earcut2;
    function earcut2(data, holeIndices, dim) {
      dim = dim || 2;
      var hasHoles = holeIndices && holeIndices.length, outerLen = hasHoles ? holeIndices[0] * dim : data.length, outerNode = linkedList(data, 0, outerLen, dim, true), triangles = [];
      if (!outerNode || outerNode.next === outerNode.prev)
        return triangles;
      var minX, minY, maxX, maxY, x, y, invSize;
      if (hasHoles)
        outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
      if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];
        for (var i = dim; i < outerLen; i += dim) {
          x = data[i];
          y = data[i + 1];
          if (x < minX)
            minX = x;
          if (y < minY)
            minY = y;
          if (x > maxX)
            maxX = x;
          if (y > maxY)
            maxY = y;
        }
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 32767 / invSize : 0;
      }
      earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);
      return triangles;
    }
    function linkedList(data, start, end, dim, clockwise) {
      var i, last;
      if (clockwise === signedArea(data, start, end, dim) > 0) {
        for (i = start; i < end; i += dim)
          last = insertNode(i, data[i], data[i + 1], last);
      } else {
        for (i = end - dim; i >= start; i -= dim)
          last = insertNode(i, data[i], data[i + 1], last);
      }
      if (last && equals5(last, last.next)) {
        removeNode(last);
        last = last.next;
      }
      return last;
    }
    function filterPoints(start, end) {
      if (!start)
        return start;
      if (!end)
        end = start;
      var p = start, again;
      do {
        again = false;
        if (!p.steiner && (equals5(p, p.next) || area(p.prev, p, p.next) === 0)) {
          removeNode(p);
          p = end = p.prev;
          if (p === p.next)
            break;
          again = true;
        } else {
          p = p.next;
        }
      } while (again || p !== end);
      return end;
    }
    function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
      if (!ear)
        return;
      if (!pass && invSize)
        indexCurve(ear, minX, minY, invSize);
      var stop = ear, prev, next;
      while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;
        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
          triangles.push(prev.i / dim | 0);
          triangles.push(ear.i / dim | 0);
          triangles.push(next.i / dim | 0);
          removeNode(ear);
          ear = next.next;
          stop = next.next;
          continue;
        }
        ear = next;
        if (ear === stop) {
          if (!pass) {
            earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
          } else if (pass === 1) {
            ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
            earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
          } else if (pass === 2) {
            splitEarcut(ear, triangles, dim, minX, minY, invSize);
          }
          break;
        }
      }
    }
    function isEar(ear) {
      var a = ear.prev, b = ear, c = ear.next;
      if (area(a, b, c) >= 0)
        return false;
      var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
      var x0 = ax < bx ? ax < cx ? ax : cx : bx < cx ? bx : cx, y0 = ay < by ? ay < cy ? ay : cy : by < cy ? by : cy, x1 = ax > bx ? ax > cx ? ax : cx : bx > cx ? bx : cx, y1 = ay > by ? ay > cy ? ay : cy : by > cy ? by : cy;
      var p = c.next;
      while (p !== a) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
          return false;
        p = p.next;
      }
      return true;
    }
    function isEarHashed(ear, minX, minY, invSize) {
      var a = ear.prev, b = ear, c = ear.next;
      if (area(a, b, c) >= 0)
        return false;
      var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
      var x0 = ax < bx ? ax < cx ? ax : cx : bx < cx ? bx : cx, y0 = ay < by ? ay < cy ? ay : cy : by < cy ? by : cy, x1 = ax > bx ? ax > cx ? ax : cx : bx > cx ? bx : cx, y1 = ay > by ? ay > cy ? ay : cy : by > cy ? by : cy;
      var minZ = zOrder(x0, y0, minX, minY, invSize), maxZ = zOrder(x1, y1, minX, minY, invSize);
      var p = ear.prevZ, n = ear.nextZ;
      while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
          return false;
        p = p.prevZ;
        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0)
          return false;
        n = n.nextZ;
      }
      while (p && p.z >= minZ) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
          return false;
        p = p.prevZ;
      }
      while (n && n.z <= maxZ) {
        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0)
          return false;
        n = n.nextZ;
      }
      return true;
    }
    function cureLocalIntersections(start, triangles, dim) {
      var p = start;
      do {
        var a = p.prev, b = p.next.next;
        if (!equals5(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
          triangles.push(a.i / dim | 0);
          triangles.push(p.i / dim | 0);
          triangles.push(b.i / dim | 0);
          removeNode(p);
          removeNode(p.next);
          p = start = b;
        }
        p = p.next;
      } while (p !== start);
      return filterPoints(p);
    }
    function splitEarcut(start, triangles, dim, minX, minY, invSize) {
      var a = start;
      do {
        var b = a.next.next;
        while (b !== a.prev) {
          if (a.i !== b.i && isValidDiagonal(a, b)) {
            var c = splitPolygon(a, b);
            a = filterPoints(a, a.next);
            c = filterPoints(c, c.next);
            earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
            earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
            return;
          }
          b = b.next;
        }
        a = a.next;
      } while (a !== start);
    }
    function eliminateHoles(data, holeIndices, outerNode, dim) {
      var queue = [], i, len4, start, end, list;
      for (i = 0, len4 = holeIndices.length; i < len4; i++) {
        start = holeIndices[i] * dim;
        end = i < len4 - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next)
          list.steiner = true;
        queue.push(getLeftmost(list));
      }
      queue.sort(compareX);
      for (i = 0; i < queue.length; i++) {
        outerNode = eliminateHole(queue[i], outerNode);
      }
      return outerNode;
    }
    function compareX(a, b) {
      return a.x - b.x;
    }
    function eliminateHole(hole, outerNode) {
      var bridge = findHoleBridge(hole, outerNode);
      if (!bridge) {
        return outerNode;
      }
      var bridgeReverse = splitPolygon(bridge, hole);
      filterPoints(bridgeReverse, bridgeReverse.next);
      return filterPoints(bridge, bridge.next);
    }
    function findHoleBridge(hole, outerNode) {
      var p = outerNode, hx = hole.x, hy = hole.y, qx = -Infinity, m;
      do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
          var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
          if (x <= hx && x > qx) {
            qx = x;
            m = p.x < p.next.x ? p : p.next;
            if (x === hx)
              return m;
          }
        }
        p = p.next;
      } while (p !== outerNode);
      if (!m)
        return null;
      var stop = m, mx = m.x, my = m.y, tanMin = Infinity, tan;
      p = m;
      do {
        if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
          tan = Math.abs(hy - p.y) / (hx - p.x);
          if (locallyInside(p, hole) && (tan < tanMin || tan === tanMin && (p.x > m.x || p.x === m.x && sectorContainsSector(m, p)))) {
            m = p;
            tanMin = tan;
          }
        }
        p = p.next;
      } while (p !== stop);
      return m;
    }
    function sectorContainsSector(m, p) {
      return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
    }
    function indexCurve(start, minX, minY, invSize) {
      var p = start;
      do {
        if (p.z === 0)
          p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
      } while (p !== start);
      p.prevZ.nextZ = null;
      p.prevZ = null;
      sortLinked(p);
    }
    function sortLinked(list) {
      var i, p, q, e, tail, numMerges, pSize, qSize, inSize = 1;
      do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;
        while (p) {
          numMerges++;
          q = p;
          pSize = 0;
          for (i = 0; i < inSize; i++) {
            pSize++;
            q = q.nextZ;
            if (!q)
              break;
          }
          qSize = inSize;
          while (pSize > 0 || qSize > 0 && q) {
            if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
              e = p;
              p = p.nextZ;
              pSize--;
            } else {
              e = q;
              q = q.nextZ;
              qSize--;
            }
            if (tail)
              tail.nextZ = e;
            else
              list = e;
            e.prevZ = tail;
            tail = e;
          }
          p = q;
        }
        tail.nextZ = null;
        inSize *= 2;
      } while (numMerges > 1);
      return list;
    }
    function zOrder(x, y, minX, minY, invSize) {
      x = (x - minX) * invSize | 0;
      y = (y - minY) * invSize | 0;
      x = (x | x << 8) & 16711935;
      x = (x | x << 4) & 252645135;
      x = (x | x << 2) & 858993459;
      x = (x | x << 1) & 1431655765;
      y = (y | y << 8) & 16711935;
      y = (y | y << 4) & 252645135;
      y = (y | y << 2) & 858993459;
      y = (y | y << 1) & 1431655765;
      return x | y << 1;
    }
    function getLeftmost(start) {
      var p = start, leftmost = start;
      do {
        if (p.x < leftmost.x || p.x === leftmost.x && p.y < leftmost.y)
          leftmost = p;
        p = p.next;
      } while (p !== start);
      return leftmost;
    }
    function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
      return (cx - px) * (ay - py) >= (ax - px) * (cy - py) && (ax - px) * (by - py) >= (bx - px) * (ay - py) && (bx - px) * (cy - py) >= (cx - px) * (by - py);
    }
    function isValidDiagonal(a, b) {
      return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
      (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
      (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
      equals5(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0);
    }
    function area(p, q, r) {
      return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    }
    function equals5(p1, p2) {
      return p1.x === p2.x && p1.y === p2.y;
    }
    function intersects(p1, q1, p2, q2) {
      var o1 = sign(area(p1, q1, p2));
      var o2 = sign(area(p1, q1, q2));
      var o3 = sign(area(p2, q2, p1));
      var o4 = sign(area(p2, q2, q1));
      if (o1 !== o2 && o3 !== o4)
        return true;
      if (o1 === 0 && onSegment(p1, p2, q1))
        return true;
      if (o2 === 0 && onSegment(p1, q2, q1))
        return true;
      if (o3 === 0 && onSegment(p2, p1, q2))
        return true;
      if (o4 === 0 && onSegment(p2, q1, q2))
        return true;
      return false;
    }
    function onSegment(p, q, r) {
      return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }
    function sign(num) {
      return num > 0 ? 1 : num < 0 ? -1 : 0;
    }
    function intersectsPolygon(a, b) {
      var p = a;
      do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b))
          return true;
        p = p.next;
      } while (p !== a);
      return false;
    }
    function locallyInside(a, b) {
      return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
    }
    function middleInside(a, b) {
      var p = a, inside = false, px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
      do {
        if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x)
          inside = !inside;
        p = p.next;
      } while (p !== a);
      return inside;
    }
    function splitPolygon(a, b) {
      var a2 = new Node(a.i, a.x, a.y), b2 = new Node(b.i, b.x, b.y), an = a.next, bp = b.prev;
      a.next = b;
      b.prev = a;
      a2.next = an;
      an.prev = a2;
      b2.next = a2;
      a2.prev = b2;
      bp.next = b2;
      b2.prev = bp;
      return b2;
    }
    function insertNode(i, x, y, last) {
      var p = new Node(i, x, y);
      if (!last) {
        p.prev = p;
        p.next = p;
      } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
      }
      return p;
    }
    function removeNode(p) {
      p.next.prev = p.prev;
      p.prev.next = p.next;
      if (p.prevZ)
        p.prevZ.nextZ = p.nextZ;
      if (p.nextZ)
        p.nextZ.prevZ = p.prevZ;
    }
    function Node(i, x, y) {
      this.i = i;
      this.x = x;
      this.y = y;
      this.prev = null;
      this.next = null;
      this.z = 0;
      this.prevZ = null;
      this.nextZ = null;
      this.steiner = false;
    }
    earcut2.deviation = function(data, holeIndices, dim, triangles) {
      var hasHoles = holeIndices && holeIndices.length;
      var outerLen = hasHoles ? holeIndices[0] * dim : data.length;
      var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
      if (hasHoles) {
        for (var i = 0, len4 = holeIndices.length; i < len4; i++) {
          var start = holeIndices[i] * dim;
          var end = i < len4 - 1 ? holeIndices[i + 1] * dim : data.length;
          polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
      }
      var trianglesArea = 0;
      for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
          (data[a] - data[c]) * (data[b + 1] - data[a + 1]) - (data[a] - data[b]) * (data[c + 1] - data[a + 1])
        );
      }
      return polygonArea === 0 && trianglesArea === 0 ? 0 : Math.abs((trianglesArea - polygonArea) / polygonArea);
    };
    function signedArea(data, start, end, dim) {
      var sum = 0;
      for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
      }
      return sum;
    }
    earcut2.flatten = function(data) {
      var dim = data[0][0].length, result = { vertices: [], holes: [], dimensions: dim }, holeIndex = 0;
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
          for (var d = 0; d < dim; d++)
            result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
          holeIndex += data[i - 1].length;
          result.holes.push(holeIndex);
        }
      }
      return result;
    };
  }
});

// node_modules/@wonderlandengine/api/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  APIVersion: () => APIVersion,
  Alignment: () => Alignment,
  Animation: () => Animation2,
  AnimationComponent: () => AnimationComponent,
  AnimationGraph: () => AnimationGraph,
  AnimationGraphManager: () => AnimationGraphManager,
  AnimationState: () => AnimationState,
  ArrayBufferSink: () => ArrayBufferSink,
  ArrayBufferSource: () => ArrayBufferSource,
  AttributeAccessor: () => AttributeAccessor,
  AudioClip: () => AudioClip,
  BitSet: () => BitSet,
  BrokenComponent: () => BrokenComponent,
  CBORReader: () => CBORReader,
  CBORType: () => CBORType,
  ChunkedSceneLoadSink: () => ChunkedSceneLoadSink,
  Collider: () => Collider,
  CollisionComponent: () => CollisionComponent,
  CollisionEventType: () => CollisionEventType,
  Component: () => Component3,
  DefaultPropertyCloner: () => DefaultPropertyCloner,
  Emitter: () => Emitter,
  Environment: () => Environment,
  Font: () => Font,
  ForceMode: () => ForceMode,
  GLTFExtensions: () => GLTFExtensions,
  GraphicsApi: () => GraphicsApi,
  I18N: () => I18N,
  InputComponent: () => InputComponent,
  InputType: () => InputType,
  Justification: () => Justification,
  LightComponent: () => LightComponent,
  LightType: () => LightType,
  LockAxis: () => LockAxis,
  LogLevel: () => LogLevel,
  LogTag: () => LogTag,
  Logger: () => Logger,
  Material: () => Material,
  MaterialManager: () => MaterialManager,
  MaterialParamType: () => MaterialParamType,
  Mesh: () => Mesh,
  MeshAttribute: () => MeshAttribute,
  MeshAttributeAccessor: () => AttributeAccessor,
  MeshComponent: () => MeshComponent,
  MeshIndexType: () => MeshIndexType,
  MeshManager: () => MeshManager,
  MeshSkinningType: () => MeshSkinningType,
  MorphTargets: () => MorphTargets,
  Object: () => Object3D2,
  Object3D: () => Object3D2,
  ParticleEffect: () => ParticleEffect,
  ParticleEffectComponent: () => ParticleEffectComponent,
  ParticleEffectManager: () => ParticleEffectManager,
  ParticleReplacementPolicy: () => ParticleReplacementPolicy,
  PhysXComponent: () => PhysXComponent,
  Physics: () => Physics,
  Pipeline: () => Pipeline,
  PipelineManager: () => PipelineManager,
  Prefab: () => Prefab,
  PrefabGLTF: () => PrefabGLTF,
  ProbeVolumeScenario: () => ProbeVolumeScenario,
  ProbeVolumeScenarioManager: () => ProbeVolumeScenarioManager,
  ProjectionType: () => ProjectionType,
  Property: () => Property,
  RayHit: () => RayHit,
  Resource: () => Resource,
  ResourceManager: () => ResourceManager,
  ResourceType: () => ResourceType,
  RetainEmitter: () => RetainEmitter,
  RootMotionMode: () => RootMotionMode,
  SSAO: () => SSAO,
  Scene: () => Scene,
  SceneResource: () => SceneResource,
  SceneType: () => SceneType,
  Shape: () => Shape,
  Skin: () => Skin,
  TextComponent: () => TextComponent,
  TextEffect: () => TextEffect,
  TextWrapMode: () => TextWrapMode,
  Texture: () => Texture,
  TextureManager: () => TextureManager,
  Type: () => Type,
  VerticalAlignment: () => VerticalAlignment,
  ViewComponent: () => ViewComponent,
  WASM: () => WASM,
  WebXR: () => WebXR,
  WonderlandEngine: () => WonderlandEngine,
  XRSessionState: () => XRSessionState,
  capitalizeFirstUTF8: () => capitalizeFirstUTF8,
  checkRuntimeCompatibility: () => checkRuntimeCompatibility,
  clamp: () => clamp,
  decode: () => decode,
  defaultPropertyCloner: () => defaultPropertyCloner,
  enumerable: () => enumerable,
  fetchStreamWithProgress: () => fetchStreamWithProgress,
  fetchWithProgress: () => fetchWithProgress,
  getBaseUrl: () => getBaseUrl,
  getFilename: () => getFilename,
  getType: () => getType,
  inheritProperties: () => inheritProperties,
  isImageLike: () => isImageLike,
  isNumber: () => isNumber,
  isString: () => isString,
  isUndefined: () => isUndefined,
  isWebGPUSupported: () => isWebGPUSupported,
  loadRuntime: () => loadRuntime,
  math: () => math,
  nativeProperty: () => nativeProperty,
  needsFlipY: () => needsFlipY,
  onImageReady: () => onImageReady,
  property: () => property,
  timeout: () => timeout,
  updateAfter: () => updateAfter,
  updateBefore: () => updateBefore
});
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __decorateClass2 = (decorators, target, key, kind) => {
  for (var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc2(target, key) : target, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = (kind ? decorator(target, key, result) : decorator(result)) || result);
  return kind && result && __defProp2(target, key, result), result;
};
var threads = () => (async (e) => {
  try {
    return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(e);
  } catch {
    return false;
  }
})(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
var Type = ((Type2) => (Type2[Type2.Native = 0] = "Native", Type2[Type2.Bool = 1] = "Bool", Type2[Type2.Int = 2] = "Int", Type2[Type2.Float = 3] = "Float", Type2[Type2.String = 4] = "String", Type2[Type2.Enum = 5] = "Enum", Type2[Type2.Object = 6] = "Object", Type2[Type2.Mesh = 7] = "Mesh", Type2[Type2.Texture = 8] = "Texture", Type2[Type2.Material = 9] = "Material", Type2[Type2.Animation = 10] = "Animation", Type2[Type2.Skin = 11] = "Skin", Type2[Type2.Color = 12] = "Color", Type2[Type2.Vector2 = 13] = "Vector2", Type2[Type2.Vector3 = 14] = "Vector3", Type2[Type2.Vector4 = 15] = "Vector4", Type2[Type2.Array = 16] = "Array", Type2[Type2.Record = 17] = "Record", Type2[Type2.ParticleEffect = 18] = "ParticleEffect", Type2[Type2.AudioClip = 19] = "AudioClip", Type2[Type2.Count = 20] = "Count", Type2))(Type || {});
var DefaultPropertyCloner = class {
  clone(type, value) {
    switch (type) {
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
        return value.slice();
      case 17: {
        if (!value || !value.constructor)
          return value;
        let RecordClass = value.constructor, result = new RecordClass();
        for (let key in RecordClass.Properties) {
          let prop = RecordClass.Properties[key];
          result[key] = this.clone(prop.type, value[key]);
        }
        return result;
      }
      default:
        return value;
    }
  }
};
var defaultPropertyCloner = new DefaultPropertyCloner();
var Property = { bool(defaultValue = false) {
  return { type: 1, default: defaultValue };
}, int(defaultValue = 0) {
  return { type: 2, default: defaultValue };
}, float(defaultValue = 0) {
  return { type: 3, default: defaultValue };
}, string(defaultValue = "") {
  return { type: 4, default: defaultValue };
}, enum(values, defaultValue) {
  return { type: 5, values, default: defaultValue };
}, object(opts) {
  return { type: 6, default: null, required: opts?.required ?? false };
}, mesh(opts) {
  return { type: 7, default: null, required: opts?.required ?? false };
}, texture(opts) {
  return { type: 8, default: null, required: opts?.required ?? false };
}, material(opts) {
  return { type: 9, default: null, required: opts?.required ?? false };
}, animation(opts) {
  return { type: 10, default: null, required: opts?.required ?? false };
}, skin(opts) {
  return { type: 11, default: null, required: opts?.required ?? false };
}, particleEffect(opts) {
  return { type: 18, default: null, required: opts?.required ?? false };
}, audioClip(opts) {
  return { type: 19, default: null, required: opts?.required ?? false };
}, color(r = 0, g = 0, b = 0, a = 1) {
  return { type: 12, default: new Float32Array([r, g, b, a]) };
}, vector2(x = 0, y = 0) {
  return { type: 13, default: new Float32Array([x, y]) };
}, vector3(x = 0, y = 0, z = 0) {
  return { type: 14, default: new Float32Array([x, y, z]) };
}, vector4(x = 0, y = 0, z = 0, w = 0) {
  return { type: 15, default: new Float32Array([x, y, z, w]) };
}, record(definition) {
  return { type: 17, record: definition, default: definition ? new definition() : void 0 };
}, array(element) {
  return { type: 16, element, default: [] };
} };
function propertyDecorator(data) {
  return function(target, propertyKey) {
    let ctor = target.constructor;
    ctor.Properties = ctor.hasOwnProperty("Properties") ? ctor.Properties : {}, ctor.Properties[propertyKey] = data;
  };
}
function enumerable() {
  return function(_, __, descriptor) {
    descriptor.enumerable = true;
  };
}
function nativeProperty() {
  return function(target, propertyKey, descriptor) {
    enumerable()(target, propertyKey, descriptor), propertyDecorator({ type: 0 })(target, propertyKey);
  };
}
var property = {};
for (let name in Property)
  property[name] = (...args) => {
    let functor = Property[name];
    return propertyDecorator(functor(...args));
  };
function updateBefore(Classes) {
  return function(constructor) {
    constructor.UpdateBefore = Classes;
  };
}
function updateAfter(Classes) {
  return function(constructor) {
    constructor.UpdateAfter = Classes;
  };
}
function isString(value) {
  return value === "" ? true : value && (typeof value == "string" || value.constructor === String);
}
function isNumber(value) {
  return value == null ? false : typeof value == "number" || value.constructor === Number;
}
function isImageLike(value) {
  return value instanceof HTMLImageElement || value instanceof HTMLVideoElement || value instanceof HTMLCanvasElement;
}
var Emitter = class {
  _listeners = [];
  _notifying = false;
  _transactions = [];
  add(listener, opts = {}) {
    let { once = false, id = void 0 } = opts, data = { id, once, callback: listener };
    return this._notifying ? (this._transactions.push({ type: 1, data }), this) : (this._listeners.push(data), this);
  }
  push(...listeners) {
    for (let cb of listeners)
      this.add(cb);
    return this;
  }
  once(listener) {
    return this.add(listener, { once: true });
  }
  remove(listener) {
    if (this._notifying)
      return this._transactions.push({ type: 2, data: listener }), this;
    let listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      let target = listeners[i];
      (target.callback === listener || target.id === listener) && listeners.splice(i--, 1);
    }
    return this;
  }
  has(listener) {
    let listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      let target = listeners[i];
      if (target.callback === listener || target.id === listener)
        return true;
    }
    return false;
  }
  notify(...data) {
    let listeners = this._listeners;
    this._notifying = true;
    for (let i = 0; i < listeners.length; ++i) {
      let listener = listeners[i];
      listener.once && listeners.splice(i--, 1);
      try {
        listener.callback(...data);
      } catch (e) {
        console.error(e);
      }
    }
    this._notifying = false, this._flushTransactions();
  }
  notifyUnsafe(...data) {
    let listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      let listener = listeners[i];
      listener.once && listeners.splice(i--, 1), listener.callback(...data);
    }
    this._flushTransactions();
  }
  promise() {
    return new Promise((res, _) => {
      this.once((...args) => {
        args.length > 1 ? res(args) : res(args[0]);
      });
    });
  }
  get listenerCount() {
    return this._listeners.length;
  }
  get isEmpty() {
    return this.listenerCount === 0;
  }
  _flushTransactions() {
    let listeners = this._listeners;
    for (let transaction of this._transactions)
      transaction.type === 1 ? listeners.push(transaction.data) : this.remove(transaction.data);
    this._transactions.length = 0;
  }
};
var RetainEmitterUndefined = {};
var RetainEmitter = class extends Emitter {
  _event = RetainEmitterUndefined;
  _reset;
  add(listener, opts) {
    let immediate = opts?.immediate ?? true;
    return this._event !== RetainEmitterUndefined && immediate && listener(...this._event), super.add(listener, opts), this;
  }
  once(listener, immediate) {
    return this.add(listener, { once: true, immediate });
  }
  notify(...data) {
    this._event = data, super.notify(...data);
  }
  notifyUnsafe(...data) {
    this._event = data, super.notifyUnsafe(...data);
  }
  reset() {
    return this._event = RetainEmitterUndefined, this;
  }
  get data() {
    return this.isDataRetained ? this._event : void 0;
  }
  get isDataRetained() {
    return this._event !== RetainEmitterUndefined;
  }
};
var ResourceType = ((ResourceType2) => (ResourceType2[ResourceType2.None = 0] = "None", ResourceType2[ResourceType2.Material = 1] = "Material", ResourceType2[ResourceType2.Mesh = 2] = "Mesh", ResourceType2[ResourceType2.Image = 3] = "Image", ResourceType2[ResourceType2.MorphTarget = 4] = "MorphTarget", ResourceType2[ResourceType2.Font = 5] = "Font", ResourceType2[ResourceType2.ParticleEffect = 6] = "ParticleEffect", ResourceType2[ResourceType2.ProbeVolumeScenario = 7] = "ProbeVolumeScenario", ResourceType2[ResourceType2.AudioClip = 8] = "AudioClip", ResourceType2[ResourceType2.Pipeline = 9] = "Pipeline", ResourceType2[ResourceType2.Count = 10] = "Count", ResourceType2))(ResourceType || {});
function createDestroyedProxy(host, type) {
  return new Proxy({}, { get(_, param) {
    if (param === "isDestroyed")
      return true;
    throw new Error(`Cannot read '${param}' of destroyed '${type.name}' resource from ${host}`);
  }, set(_, param) {
    throw new Error(`Cannot write '${param}' of destroyed '${type.name}' resource from ${host}`);
  } });
}
var Resource = class {
  static getResourceType() {
    return null;
  }
  _index = -1;
  _id = -1;
  _engine;
  constructor(engine2, index) {
    this._engine = engine2, this._index = index, this._id = index;
  }
  get engine() {
    return this._engine;
  }
  get index() {
    return this._index;
  }
  get origin() {
    let type = this.constructor.getResourceType();
    if (type === null)
      return null;
    let index = this.engine.wasm._wl_resource_originScene(type, this._index);
    return index >= 0 ? this.engine._scenes[index] : null;
  }
  equals(other) {
    return other ? this._index === other._index : false;
  }
  get isDestroyed() {
    return this._index <= 0;
  }
};
var SceneResource = class _SceneResource {
  static _pack(scene, index) {
    return scene << 22 | index;
  }
  static _unpackSceneIndex(packed) {
    return packed >> 22;
  }
  static _unpackId(packed) {
    return packed & 4194303;
  }
  _index = -1;
  _id = -1;
  _scene;
  constructor(scene, index) {
    this._scene = scene, this._index = index, this._id = _SceneResource._pack(scene._index, index);
  }
  equals(other) {
    return other ? this._id === other._id : false;
  }
  get scene() {
    return this._scene;
  }
  get engine() {
    return this._scene.engine;
  }
  get index() {
    return this._index;
  }
  get isDestroyed() {
    return this._id <= 0;
  }
};
var ResourceManager = class {
  _host;
  _cache = [];
  _template;
  _destructor = null;
  _engine;
  constructor(host, Class) {
    this._host = host, this._template = Class, this._engine = host.engine ?? host;
  }
  wrap(index) {
    return index <= 0 ? null : this._cache[index] ?? (this._cache[index] = new this._template(this._host, index));
  }
  loadedFromScene(prefab) {
    let type = this._resourceType;
    if (type === null)
      return [];
    let result = [], wasm = this.engine.wasm, count = wasm._wl_resource_count(type);
    for (let i = 1; i < count; ++i) {
      if (wasm._wl_resource_destroyed(type, i))
        continue;
      let resource = this.wrap(i);
      resource.origin === prefab && result.push(resource);
    }
    return result;
  }
  all() {
    let type = this._resourceType;
    if (type === null)
      return [];
    let wasm = this.engine.wasm, count = wasm._wl_resource_count(type), result = [];
    for (let i = 1; i < count; ++i)
      wasm._wl_resource_destroyed(type, i) || result.push(this.wrap(i));
    return result;
  }
  get(index) {
    return this._cache[index] ?? null;
  }
  get allocatedCount() {
    return this._cache.length;
  }
  get count() {
    let count = 0;
    for (let res of this._cache)
      res && res.index >= 0 && ++count;
    return count;
  }
  get engine() {
    return this._engine;
  }
  get _resourceType() {
    let ResourceClass = this._template;
    return ResourceClass.getResourceType ? ResourceClass.getResourceType() : null;
  }
  _destroy(instance) {
    let index = instance.index;
    instance._index = -1, instance._id = -1, this._cache[index] = null, this.engine.erasePrototypeOnDestroy && (this._destructor || (this._destructor = createDestroyedProxy(this._host, this._template)), Object.setPrototypeOf(instance, this._destructor));
  }
  _clear() {
    if (this.engine.erasePrototypeOnDestroy) {
      for (let i = 0; i < this._cache.length; ++i) {
        let instance = this._cache[i];
        instance && this._destroy(instance);
      }
      this._cache.length = 0;
    }
  }
};
function decode(data, tagger = (_, value) => value, options = {}) {
  let reader = new CBORReader(data);
  reader.tagger = tagger, options.dictionary && (reader.dictionary = options.dictionary);
  let ret = reader.decodeItem();
  if (reader.offset !== data.byteLength)
    throw new Error("CBORError: Remaining bytes");
  return ret;
}
var CBORType = ((CBORType2) => (CBORType2[CBORType2.Array = 0] = "Array", CBORType2[CBORType2.Record = 1] = "Record", CBORType2[CBORType2.Constant = 2] = "Constant", CBORType2[CBORType2.Native = 3] = "Native", CBORType2))(CBORType || {});
function getType(typeInfo) {
  let majorType = typeInfo >> 5, additionalInformation = typeInfo & 31;
  switch (majorType) {
    case 4:
      return 0;
    case 5:
      return 1;
    case 7:
      return 2;
  }
  return 3;
}
function isUndefined(type, length5) {
  return type === 2 && length5 === 23;
}
var CBORReader = class {
  dataView;
  data;
  offset;
  tagger = (_, value) => value;
  dictionary = "object";
  constructor(data) {
    this.dataView = new DataView(data.buffer, data.byteOffset, data.byteLength), this.data = data, this.offset = 0;
  }
  readTypeInfo() {
    return this.readUint8();
  }
  readArrayLength(typeInfo) {
    let majorType = typeInfo >> 5, additionalInformation = typeInfo & 31, length5 = this.readLength(additionalInformation);
    if (length5 < 0 && (majorType < 2 || 6 < majorType))
      throw new Error("CBORError: Invalid length");
    return length5;
  }
  readItem(typeInfo, inputLen = null) {
    let majorType = typeInfo >> 5, additionalInformation = typeInfo & 31, i;
    if (majorType === 7)
      switch (additionalInformation) {
        case 25:
          return this.readFloat16();
        case 26:
          return this.readFloat32();
        case 27:
          return this.readFloat64();
      }
    let length5 = inputLen === null ? this.readLength(additionalInformation) : inputLen;
    if (length5 < 0 && (majorType < 2 || 6 < majorType))
      throw new Error("CBORError: Invalid length");
    switch (majorType) {
      case 0:
        return length5;
      case 1:
        return typeof length5 == "number" ? -1 - length5 : -1n - length5;
      case 2: {
        if (length5 < 0) {
          let elements = [], fullArrayLength = 0;
          for (; (length5 = this.readIndefiniteStringLength(majorType)) >= 0; )
            fullArrayLength += length5, elements.push(this.readArrayBuffer(length5));
          let fullArray = new Uint8Array(fullArrayLength), fullArrayOffset = 0;
          for (i = 0; i < elements.length; ++i)
            fullArray.set(elements[i], fullArrayOffset), fullArrayOffset += elements[i].length;
          return fullArray;
        }
        return this.readArrayBuffer(length5).slice();
      }
      case 3: {
        let utf16data = [];
        if (length5 < 0)
          for (; (length5 = this.readIndefiniteStringLength(majorType)) >= 0; )
            this.appendUtf16Data(utf16data, length5);
        else
          this.appendUtf16Data(utf16data, length5);
        let string = "", DECODE_CHUNK_SIZE = 8192;
        for (i = 0; i < utf16data.length; i += DECODE_CHUNK_SIZE)
          string += String.fromCharCode.apply(null, utf16data.slice(i, i + DECODE_CHUNK_SIZE));
        return string;
      }
      case 4: {
        let retArray;
        if (length5 < 0)
          for (retArray = []; !this.readBreak(); )
            retArray.push(this.decodeItem());
        else
          for (retArray = new Array(length5), i = 0; i < length5; ++i)
            retArray[i] = this.decodeItem();
        return retArray;
      }
      case 5: {
        if (this.dictionary === "map") {
          let retMap = /* @__PURE__ */ new Map();
          for (i = 0; i < length5 || length5 < 0 && !this.readBreak(); ++i) {
            let key = this.decodeItem();
            if (retMap.has(key))
              throw new Error("CBORError: Duplicate key encountered");
            retMap.set(key, this.decodeItem());
          }
          return retMap;
        }
        let retObject = {};
        for (i = 0; i < length5 || length5 < 0 && !this.readBreak(); ++i) {
          let key = this.decodeItem();
          if (Object.prototype.hasOwnProperty.call(retObject, key))
            throw new Error("CBORError: Duplicate key encountered");
          retObject[key] = this.decodeItem();
        }
        return retObject;
      }
      case 6: {
        let value = this.decodeItem(), tag = length5;
        if (value instanceof Uint8Array)
          switch (tag) {
            case 2:
            case 3:
              let num = value.reduce((acc, n) => (acc << 8n) + BigInt(n), 0n);
              return tag == 3 && (num = -1n - num), num;
            case 64:
              return value;
            case 72:
              return new Int8Array(value.buffer);
            case 69:
              return new Uint16Array(value.buffer);
            case 77:
              return new Int16Array(value.buffer);
            case 70:
              return new Uint32Array(value.buffer);
            case 78:
              return new Int32Array(value.buffer);
            case 71:
              return new BigUint64Array(value.buffer);
            case 79:
              return new BigInt64Array(value.buffer);
            case 85:
              return new Float32Array(value.buffer);
            case 86:
              return new Float64Array(value.buffer);
          }
        return this.tagger(tag, value);
      }
      case 7:
        switch (length5) {
          case 20:
            return false;
          case 21:
            return true;
          case 22:
            return null;
          case 23:
            return;
          default:
            return length5;
        }
    }
  }
  decodeItem() {
    let initialByte = this.readUint8();
    return this.readItem(initialByte);
  }
  readArrayBuffer(length5) {
    return this.commitRead(length5, this.data.subarray(this.offset, this.offset + length5));
  }
  readFloat16() {
    let POW_2_24 = 5960464477539063e-23, tempArrayBuffer = new ArrayBuffer(4), tempDataView = new DataView(tempArrayBuffer), value = this.readUint16(), sign = value & 32768, exponent = value & 31744, fraction = value & 1023;
    if (exponent === 31744)
      exponent = 261120;
    else if (exponent !== 0)
      exponent += 114688;
    else if (fraction !== 0)
      return (sign ? -1 : 1) * fraction * POW_2_24;
    return tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13), tempDataView.getFloat32(0);
  }
  readFloat32() {
    return this.commitRead(4, this.dataView.getFloat32(this.offset));
  }
  readFloat64() {
    return this.commitRead(8, this.dataView.getFloat64(this.offset));
  }
  readUint8() {
    return this.commitRead(1, this.data[this.offset]);
  }
  readUint16() {
    return this.commitRead(2, this.dataView.getUint16(this.offset));
  }
  readUint32() {
    return this.commitRead(4, this.dataView.getUint32(this.offset));
  }
  readUint64() {
    return this.commitRead(8, this.dataView.getBigUint64(this.offset));
  }
  readBreak() {
    return this.data[this.offset] !== 255 ? false : (this.offset += 1, true);
  }
  readLength(additionalInformation) {
    if (additionalInformation < 24)
      return additionalInformation;
    if (additionalInformation === 24)
      return this.readUint8();
    if (additionalInformation === 25)
      return this.readUint16();
    if (additionalInformation === 26)
      return this.readUint32();
    if (additionalInformation === 27) {
      let integer = this.readUint64();
      return integer <= Number.MAX_SAFE_INTEGER ? Number(integer) : integer;
    }
    if (additionalInformation === 31)
      return -1;
    throw new Error("CBORError: Invalid length encoding");
  }
  readIndefiniteStringLength(majorType) {
    let initialByte = this.readUint8();
    if (initialByte === 255)
      return -1;
    let length5 = this.readLength(initialByte & 31);
    if (length5 < 0 || initialByte >> 5 !== majorType)
      throw new Error("CBORError: Invalid indefinite length element");
    return Number(length5);
  }
  appendUtf16Data(utf16data, length5) {
    for (let i = 0; i < length5; ++i) {
      let value = this.readUint8();
      value & 128 && (value < 224 ? (value = (value & 31) << 6 | this.readUint8() & 63, length5 -= 1) : value < 240 ? (value = (value & 15) << 12 | (this.readUint8() & 63) << 6 | this.readUint8() & 63, length5 -= 2) : (value = (value & 7) << 18 | (this.readUint8() & 63) << 12 | (this.readUint8() & 63) << 6 | this.readUint8() & 63, length5 -= 3)), value < 65536 ? utf16data.push(value) : (value -= 65536, utf16data.push(55296 | value >> 10), utf16data.push(56320 | value & 1023));
    }
  }
  commitRead(length5, value) {
    return this.offset += length5, value;
  }
};
function createDestroyedProxy2(type) {
  return new Proxy({}, { get(_, param) {
    if (param === "isDestroyed")
      return true;
    throw new Error(`Cannot read '${param}' of destroyed ${type}`);
  }, set(_, param) {
    throw new Error(`Cannot write '${param}' of destroyed ${type}`);
  } });
}
var DestroyedComponentInstance = createDestroyedProxy2("component");
var ComponentManagers = class {
  animation = -1;
  collision = -1;
  js = -1;
  physx = -1;
  view = -1;
  _cache = [];
  _constructors;
  _nativeManagers = /* @__PURE__ */ new Map();
  _scene;
  constructor(scene) {
    this._scene = scene;
    let wasm = this._scene.engine.wasm, native = [AnimationComponent, CollisionComponent, InputComponent, LightComponent, MeshComponent, PhysXComponent, TextComponent, ViewComponent, ParticleEffectComponent];
    this._cache = new Array(native.length), this._constructors = new Array(native.length);
    for (let Class of native) {
      let ptr2 = wasm.tempUTF8(Class.TypeName), manager = wasm._wl_scene_get_component_manager_index(scene._index, ptr2);
      this._constructors[manager] = Class, this._cache[manager] = [], this._nativeManagers.set(Class.TypeName, manager);
    }
    this.animation = this._nativeManagers.get(AnimationComponent.TypeName), this.collision = this._nativeManagers.get(CollisionComponent.TypeName), this.physx = this._nativeManagers.get(PhysXComponent.TypeName), this.view = this._nativeManagers.get(ViewComponent.TypeName);
    let ptr = wasm.tempUTF8("js");
    this.js = wasm._wl_scene_get_component_manager_index(scene._index, ptr), this._cache[this.js] = [];
  }
  createJs(index, id, type, object) {
    let ctor = this._scene.engine.wasm._componentTypes[type];
    if (!ctor)
      throw new Error(`Type index ${type} isn't registered`);
    let log = this._scene.engine.log, component = null;
    try {
      component = new ctor(this._scene, this.js, id);
    } catch (e) {
      log.error(2, `Exception during instantiation of component ${ctor.TypeName}`), log.error(2, e), component = new BrokenComponent(this._scene);
    }
    component._object = this._scene.wrap(object);
    try {
      component.resetProperties();
    } catch (e) {
      log.error(2, `Exception during ${component.type} resetProperties() on object ${component.object.name}`), log.error(2, e);
    }
    return this._scene._jsComponents[index] = component, this._cache[this.js][id] = component, component;
  }
  components(type, active) {
    return this.componentsFromTypename(type.TypeName, active);
  }
  componentsFromTypename(typename, active) {
    let wasm = this._scene.engine.wasm, manager = this.getNativeManager(typename) ?? this.js, subTypeIndex = manager === this.js ? wasm._componentTypeIndices[typename] ?? 0 : 0, maxRead = wasm._tempMemSize / 4, components = [], read = 0, offset2 = 0;
    for (; read = wasm._wl_scene_get_components(this._scene._index, manager, subTypeIndex, active, offset2, maxRead, wasm._tempMem); ) {
      for (let i = 0; i < read; ++i) {
        let id = wasm._tempMemUint32[i];
        components.push(this.wrapAny(manager, id));
      }
      offset2 += maxRead;
    }
    return components;
  }
  componentAt(type, index) {
    let wasm = this._scene.engine.wasm, manager = this.getNativeManager(type.TypeName), id = wasm._wl_scene_get_component(this._scene._index, manager, index);
    return this.wrapAny(manager, id);
  }
  get(manager, id) {
    return this._cache[manager][id] ?? null;
  }
  wrapAnimation(id) {
    return this.wrapNative(this.animation, id);
  }
  wrapCollision(id) {
    return this.wrapNative(this.collision, id);
  }
  wrapView(id) {
    return this.wrapNative(this.view, id);
  }
  wrapPhysx(id) {
    return this.wrapNative(this.physx, id);
  }
  wrapNative(manager, id) {
    if (id < 0)
      return null;
    let cache = this._cache[manager];
    if (cache[id])
      return cache[id];
    let scene = this._scene, Class = this._constructors[manager], component = new Class(scene, manager, id);
    return cache[id] = component, component;
  }
  wrapAny(manager, id) {
    if (id < 0)
      return null;
    if (manager === this.js) {
      let found = this._cache[this.js][id];
      if (!found)
        throw new Error("JS components must always be cached");
      return found.constructor !== BrokenComponent ? found : null;
    }
    return this.wrapNative(manager, id);
  }
  getNativeManager(name) {
    let manager = this._nativeManagers.get(name);
    return manager !== void 0 ? manager : null;
  }
  destroy(instance) {
    let localId = instance._localId, manager = instance._manager;
    instance._id = -1, instance._localId = -1, instance._manager = -1, this._scene.engine.erasePrototypeOnDestroy && instance && Object.setPrototypeOf(instance, DestroyedComponentInstance), this._cache[manager][localId] = null;
  }
  get managersCount() {
    return this._scene.engine.wasm._wl_scene_get_component_manager_count(this._scene._index);
  }
};
function resetComponentProperties(record) {
  let properties = record.constructor.Properties;
  if (properties)
    for (let name in properties) {
      let property2 = properties[name], cloner = property2.cloner ?? defaultPropertyCloner;
      record[name] = cloner.clone(property2.type, property2.default);
    }
}
function setupComponentClass(ctor) {
  inheritProperties(ctor);
  for (let name in ctor.Properties) {
    let prop = ctor.Properties[name], record = null;
    switch (prop.type) {
      case 17:
        record = prop.record;
        break;
      case 16:
        record = prop.element?.record;
        break;
      default:
        break;
    }
    record && !record._propertyOrder && setupComponentClass(record);
  }
  _setupDefaults(ctor), _setPropertyOrder(ctor);
}
var ComponentPropertyDecoder = class {
  scene;
  offsets;
  constructor(scene, offsets) {
    this.scene = scene, this.offsets = offsets;
  }
  decode(cbor, component) {
    let ctor = component.constructor;
    ctor._propertyOrder || setupComponentClass(ctor);
    let typeInfo = cbor.readTypeInfo();
    if (ctor === BrokenComponent)
      return cbor.readItem(typeInfo);
    if (getType(typeInfo) !== 0)
      return this._error(`${component} parameters not encoded as an array.`), cbor.readItem(typeInfo);
    let paramNames = ctor._propertyOrder, count = cbor.readArrayLength(typeInfo);
    if (count !== paramNames.length)
      return this._error(`${component} has ${count} parameters encoded, but expected ${paramNames.length}`), cbor.readItem(typeInfo, count);
    for (let j = 0; j < count; ++j) {
      let name = paramNames[j], property2 = ctor.Properties[name];
      component[name] = this.decodeProperty(cbor, name, property2);
    }
  }
  decodeProperty(cbor, name, property2) {
    let typeInfo = cbor.readTypeInfo();
    if (property2.type === 17)
      return this.decodeRecordProperty(cbor, name, property2, typeInfo);
    if (property2.type === 16)
      return this.decodeArrayProperty(cbor, name, property2, typeInfo);
    let value = cbor.readItem(typeInfo);
    if (value === void 0)
      return value = (property2.cloner ?? defaultPropertyCloner).clone(property2.type, property2.default), value;
    typeof value == "number" && (value += this.offsets[property2.type]);
    let engine2 = this.scene.engine;
    switch (property2.type) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 13:
      case 14:
      case 15:
        return value;
      case 6: {
        let wasm = engine2.wasm;
        return value ? this.scene.wrap(wasm._wl_object_id(this.scene._index, value)) : null;
      }
      case 7:
        return engine2.meshes.wrap(value);
      case 8:
        return engine2.textures.wrap(value);
      case 9:
        return engine2.materials.wrap(value);
      case 18:
        return engine2.particleEffects.wrap(value);
      case 10:
        return this.scene.animations.wrap(value);
      case 11:
        return this.scene.skins.wrap(value);
      case 12: {
        let max2 = (1 << value.BYTES_PER_ELEMENT * 8) - 1;
        return Float32Array.from(value, (f, _) => f / max2);
      }
      case 19:
        return engine2.audioClips.wrap(value);
    }
  }
  decodeRecordProperty(cbor, name, property2, typeInfo) {
    let cborType = getType(typeInfo);
    if (cborType !== 0 && cborType !== 2)
      return this._error(`Record parameter '${name}' not serialized as an array`), cbor.readItem(typeInfo), null;
    let record = property2.record;
    if (!record)
      return this._error(`Record parameter '${name}' .record is undefined`), cbor.readItem(typeInfo), null;
    record._propertyOrder || setupComponentClass(record);
    let propertyOrder = record._propertyOrder, count = cbor.readArrayLength(typeInfo);
    if (isUndefined(cborType, count))
      return (property2.cloner ?? defaultPropertyCloner).clone(property2.type, property2.default);
    let result = new record();
    if (count !== propertyOrder.length) {
      let propsCount = propertyOrder.length;
      return this._error(`Record parameter ${name} has ${count} sub-parameters encoded, but expected ${propsCount}`), cbor.readItem(typeInfo, count), result;
    }
    let order = record._propertyOrder;
    for (let i = 0; i < order.length; ++i) {
      let key = order[i], prop = record.Properties[key];
      result[key] = this.decodeProperty(cbor, key, prop);
    }
    return result;
  }
  decodeArrayProperty(cbor, name, property2, typeInfo) {
    let log = this.scene.engine.log, cborType = getType(typeInfo);
    if (cborType !== 0 && cborType !== 2)
      return this._error(`Array parameter '${name}' not serialized as an array`), cbor.readItem(typeInfo), [];
    if (!property2.element)
      return this._error(`Array parameter '${name}' .element property is undefined`), cbor.readItem(typeInfo), [];
    let count = cbor.readArrayLength(typeInfo);
    if (isUndefined(cborType, count))
      return [];
    let result = new Array(count);
    for (let i = 0; i < count; ++i)
      result[i] = this.decodeProperty(cbor, name, property2.element);
    return result;
  }
  _error(msg) {
    this.scene.engine.log.error(0, msg);
  }
};
var ComponentDefaults = /* @__PURE__ */ new Map();
for (let generator of Object.values(Property)) {
  let prop = generator(void 0);
  ComponentDefaults.set(prop.type, prop.default);
}
function _setupDefaults(ctor) {
  for (let name in ctor.Properties) {
    let p = ctor.Properties[name];
    if (p.type === 5)
      p.values?.length ? (typeof p.default != "number" && (p.default = p.values.indexOf(p.default)), (p.default < 0 || p.default >= p.values.length) && (p.default = 0)) : p.default = void 0;
    else if ((p.type === 12 || p.type === 13 || p.type === 14 || p.type === 15) && Array.isArray(p.default))
      p.default = Float32Array.from(p.default);
    else if (p.type === 17 && p.record)
      p.default = new p.record(), resetComponentProperties(p.default);
    else if (p.default === void 0) {
      let cloner = p.cloner ?? defaultPropertyCloner;
      p.default = cloner.clone(p.type, ComponentDefaults.get(p.type));
    }
    ctor.prototype[name] = p.default;
  }
}
function _setPropertyOrder(ctor) {
  ctor._propertyOrder = ctor.hasOwnProperty("Properties") ? Object.keys(ctor.Properties).sort() : [];
}
var AnimationGraphManager = class extends ResourceManager {
  constructor(scene) {
    super(scene, AnimationGraph);
  }
  blend1D(anims) {
    if (anims.length <= 1)
      throw new Error("At least 2 animations are required to create a blend graph.");
    let wasm = this.engine.wasm;
    for (var i = 0; i < anims.length; ++i)
      wasm._tempMemInt[i] = anims[i]._id;
    let index = wasm._wl_animationGraph_create1DBlend(wasm._tempMem, anims.length), instance = new AnimationGraph(this._host, index);
    return this._cache[instance.index] = instance, instance;
  }
};
var FetchProgressTransformer = class {
  #progress = 0;
  #callback;
  #totalSize;
  constructor(callback, totalSize = 0) {
    this.#callback = callback, this.#totalSize = totalSize;
  }
  transform(chunk, controller) {
    controller.enqueue(chunk), this.#progress += chunk.length, this.#totalSize > 0 && this.#callback(this.#progress, this.#totalSize);
  }
  flush() {
    this.#callback(this.#progress, this.#progress);
  }
};
var ArrayBufferSink = class {
  #buffer;
  #offset = 0;
  constructor(size = 0) {
    this.#buffer = new Uint8Array(size);
  }
  get arrayBuffer() {
    let arrayBuffer = this.#buffer.buffer;
    return this.#offset < arrayBuffer.byteLength ? arrayBuffer.slice(0, this.#offset) : arrayBuffer;
  }
  write(chunk) {
    let newLength = this.#offset + chunk.length;
    if (newLength > this.#buffer.length) {
      let newBuffer = new Uint8Array(Math.max(this.#buffer.length * 1.5, newLength));
      newBuffer.set(this.#buffer), this.#buffer = newBuffer;
    }
    this.#buffer.set(chunk, this.#offset), this.#offset = newLength;
  }
};
var ArrayBufferSource = class {
  #buffer;
  constructor(buffer) {
    this.#buffer = buffer;
  }
  start(controller) {
    this.#buffer.byteLength > 0 && controller.enqueue(new Uint8Array(this.#buffer)), controller.close();
  }
};
async function fetchWithProgress(path, onProgress, signal) {
  let res = await fetch(path, { signal });
  if (!res.ok)
    throw res.statusText;
  if (!onProgress || !res.body)
    return res.arrayBuffer();
  let size = Number(res.headers.get("Content-Length") ?? 0);
  Number.isNaN(size) && (size = 0);
  let sink = new ArrayBufferSink(size);
  return await res.body.pipeThrough(new TransformStream(new FetchProgressTransformer(onProgress, size))).pipeTo(new WritableStream(sink)), sink.arrayBuffer;
}
async function fetchStreamWithProgress(path, onProgress, signal) {
  let res = await fetch(path, { signal });
  if (!res.ok)
    throw res.statusText;
  let body = res.body ?? new ReadableStream(), size = Number(res.headers.get("Content-Length") ?? 0);
  return Number.isNaN(size) && (size = 0), onProgress ? body.pipeThrough(new TransformStream(new FetchProgressTransformer(onProgress, size))) : body;
}
function getBaseUrl(url) {
  return url.substring(0, url.lastIndexOf("/"));
}
function getFilename(url) {
  url.endsWith("/") && (url = url.substring(0, url.lastIndexOf("/")));
  let lastSlash = url.lastIndexOf("/");
  return lastSlash < 0 ? url : url.substring(lastSlash + 1);
}
function onImageReady(image) {
  return new Promise((res, rej) => {
    if (image instanceof HTMLVideoElement) {
      if (image.readyState >= 2) {
        res(image);
        return;
      }
      image.addEventListener("loadeddata", () => {
        image.readyState >= 2 && res(image);
      }, { once: true });
      return;
    } else if (!(image instanceof HTMLImageElement) || image.complete) {
      res(image);
      return;
    }
    image.addEventListener("load", () => res(image), { once: true }), image.addEventListener("error", rej, { once: true });
  });
}
var DestroyedObjectInstance = createDestroyedProxy2("object");
var Prefab = class _Prefab {
  static makeUrlLoadOptions(options) {
    return isString(options) ? { url: options } : options;
  }
  static async loadBuffer(options, progress) {
    let opts = _Prefab.makeUrlLoadOptions(options), buffer = await fetchWithProgress(opts.url, progress, opts.signal), baseURL = getBaseUrl(opts.url), filename = getFilename(opts.url);
    return { ...opts, buffer, baseURL, filename };
  }
  static async loadStream(options, progress) {
    let opts = _Prefab.makeUrlLoadOptions(options), stream = await fetchStreamWithProgress(opts.url, progress, opts.signal), baseURL = getBaseUrl(opts.url), filename = getFilename(opts.url);
    return { ...opts, stream, baseURL, filename };
  }
  static validateBufferOptions(options) {
    let { buffer, baseURL, filename = "scene.bin" } = options;
    if (!buffer)
      throw new Error("missing 'buffer' in options");
    if (!isString(baseURL))
      throw new Error("missing 'baseURL' in options");
    let url = baseURL ? `${baseURL}/${filename}` : filename;
    return { buffer, baseURL, url };
  }
  static validateStreamOptions(options) {
    let { stream, baseURL, filename = "scene.bin" } = options;
    if (!stream)
      throw new Error("missing 'stream' in options");
    if (!isString(baseURL))
      throw new Error("missing 'baseURL' in options");
    let url = baseURL ? `${baseURL}/${filename}` : filename;
    return { stream, baseURL, url };
  }
  _index;
  _engine;
  _components;
  _jsComponents = [];
  _pxCallbacks = /* @__PURE__ */ new Map();
  _animations;
  _animationGraphs;
  _skins;
  _objectCache = [];
  _pendingDestroy = 0;
  constructor(engine2, index) {
    this._engine = engine2, this._index = index, this._components = new ComponentManagers(this), this._animations = new ResourceManager(this, Animation2), this._animationGraphs = new AnimationGraphManager(this), this._skins = new ResourceManager(this, Skin);
  }
  addChild() {
    return this.wrap(0).addChild();
  }
  addObject(parent = null) {
    if (parent?.markedDestroyed)
      throw new Error(`Failed to add object. ${parent} is marked as destroyed.`);
    return this.assertOrigin(parent), (parent ?? this.wrap(0)).addChild();
  }
  addObjects(count, parent = null, componentCountHint = 0) {
    let parentId = parent ? parent._id : 0;
    this.engine.wasm.requireTempMem(count * 2);
    let actualCount = this.engine.wasm._wl_scene_add_objects(this._index, parentId, count, componentCountHint || 0, this.engine.wasm._tempMem, this.engine.wasm._tempMemSize >> 1), ids = this.engine.wasm._tempMemUint16.subarray(0, actualCount), wrapper = this.wrap.bind(this);
    return Array.from(ids, wrapper);
  }
  reserveObjects(objectCount, componentCountPerType) {
    let wasm = this.engine.wasm;
    if (!componentCountPerType)
      return;
    let countsPerTypeIndex = wasm._tempMemInt, managerCount = this._components.managersCount;
    for (let i = 0; i < managerCount; ++i)
      countsPerTypeIndex[i] = 0;
    let names = Object.keys(componentCountPerType);
    for (let name of names) {
      let count = componentCountPerType[name], nativeIndex = this._components.getNativeManager(name);
      countsPerTypeIndex[nativeIndex !== null ? nativeIndex : this._components.js] += count;
    }
    wasm._wl_scene_reserve_objects(this._index, objectCount, wasm._tempMem);
  }
  getChildren(out = new Array(this.childrenCount)) {
    return this.wrap(0).getChildren(out);
  }
  getComponents(typeOrClass) {
    let typename = isString(typeOrClass) ? typeOrClass : typeOrClass.TypeName;
    return this._components.componentsFromTypename(typename, false);
  }
  getActiveComponents(typeOrClass) {
    let typename = isString(typeOrClass) ? typeOrClass : typeOrClass.TypeName;
    return this._components.componentsFromTypename(typename, true);
  }
  get children() {
    return this.wrap(0).children;
  }
  get childrenCount() {
    let root = this.wrap(0);
    return this.engine.wasm._wl_object_get_children_count(root._id);
  }
  findByName(name, recursive = false) {
    return this.wrap(0).findByName(name, recursive);
  }
  findByNameDirect(name) {
    return this.wrap(0).findByNameDirect(name);
  }
  findByNameRecursive(name) {
    return this.wrap(0).findByNameRecursive(name);
  }
  wrap(objectId) {
    let cache = this._objectCache;
    return cache[objectId] || (cache[objectId] = new Object3D2(this, objectId));
  }
  destroy() {
    if (this._pendingDestroy > 0)
      throw new Error("It's forbidden to destroy a scene from onDestroy().");
    this._pxCallbacks.clear(), this.engine._destroyScene(this);
  }
  destroyResources(options = {}) {
    let { loaded = true } = options;
    if (loaded)
      for (let manager of [this.engine.textures, this.engine.meshes, this.engine.particleEffects]) {
        let resources = manager.loadedFromScene(this);
        for (let r of resources)
          r.destroy();
      }
  }
  get isActive() {
    return !!this.engine.wasm._wl_scene_active(this._index);
  }
  get baseURL() {
    let wasm = this.engine.wasm, ptr = wasm._wl_scene_get_baseURL(this._index);
    return ptr ? wasm.UTF8ToString(ptr) : "";
  }
  get filename() {
    let wasm = this.engine.wasm, ptr = wasm._wl_scene_get_filename(this._index);
    return ptr ? wasm.UTF8ToString(ptr) : "";
  }
  get animations() {
    return this._animations;
  }
  get animationsGraphs() {
    return this._animationGraphs;
  }
  get skins() {
    return this._skins;
  }
  get engine() {
    return this._engine;
  }
  get isDestroyed() {
    return this._index < 0;
  }
  toString() {
    return this.isDestroyed ? "Scene(destroyed)" : `Scene('${this.filename}', ${this._index})`;
  }
  assertOrigin(other) {
    if (other && other.scene !== this)
      throw new Error(`Attempt to use ${other} from ${other.scene} in ${this}`);
  }
  _initialize() {
    this.engine.wasm._wl_scene_initialize(this._index);
  }
  _destroyObject(localId) {
    let instance = this._objectCache[localId];
    instance && (instance._id = -1, instance._localId = -1, this.engine.erasePrototypeOnDestroy && instance && Object.setPrototypeOf(instance, DestroyedObjectInstance), this._objectCache[localId] = null);
  }
  _createComponentJs(index, id, type, objectId) {
    let component = this._components.createJs(index, id, type, objectId);
    this._onComponentCreated(component, type);
  }
  _destroyComponent(manager, id) {
    let component = this._components.get(manager, id);
    component !== null && (++this._pendingDestroy, this._onComponentDestroyed(component), component._triggerOnDestroy(), --this._pendingDestroy);
  }
  _onComponentCreated(component, type) {
  }
  _onComponentDestroyed(component) {
  }
};
var LogTag = ((LogTag2) => (LogTag2[LogTag2.Engine = 0] = "Engine", LogTag2[LogTag2.Scene = 1] = "Scene", LogTag2[LogTag2.Component = 2] = "Component", LogTag2))(LogTag || {});
var Collider = ((Collider2) => (Collider2[Collider2.Sphere = 0] = "Sphere", Collider2[Collider2.AxisAlignedBox = 1] = "AxisAlignedBox", Collider2[Collider2.Box = 2] = "Box", Collider2))(Collider || {});
var Alignment = ((Alignment2) => (Alignment2[Alignment2.Left = 0] = "Left", Alignment2[Alignment2.Center = 1] = "Center", Alignment2[Alignment2.Right = 2] = "Right", Alignment2))(Alignment || {});
var VerticalAlignment = ((VerticalAlignment2) => (VerticalAlignment2[VerticalAlignment2.Line = 0] = "Line", VerticalAlignment2[VerticalAlignment2.Middle = 1] = "Middle", VerticalAlignment2[VerticalAlignment2.Top = 2] = "Top", VerticalAlignment2[VerticalAlignment2.Bottom = 3] = "Bottom", VerticalAlignment2))(VerticalAlignment || {});
var Justification = VerticalAlignment;
var TextEffect = ((TextEffect2) => (TextEffect2[TextEffect2.None = 0] = "None", TextEffect2[TextEffect2.Outline = 1] = "Outline", TextEffect2[TextEffect2.Shadow = 2] = "Shadow", TextEffect2))(TextEffect || {});
var TextWrapMode = ((TextWrapMode2) => (TextWrapMode2[TextWrapMode2.None = 0] = "None", TextWrapMode2[TextWrapMode2.Soft = 1] = "Soft", TextWrapMode2[TextWrapMode2.Hard = 2] = "Hard", TextWrapMode2[TextWrapMode2.Clip = 3] = "Clip", TextWrapMode2))(TextWrapMode || {});
var InputType = ((InputType3) => (InputType3[InputType3.Head = 0] = "Head", InputType3[InputType3.EyeLeft = 1] = "EyeLeft", InputType3[InputType3.EyeRight = 2] = "EyeRight", InputType3[InputType3.ControllerLeft = 3] = "ControllerLeft", InputType3[InputType3.ControllerRight = 4] = "ControllerRight", InputType3[InputType3.RayLeft = 5] = "RayLeft", InputType3[InputType3.RayRight = 6] = "RayRight", InputType3))(InputType || {});
var ProjectionType = ((ProjectionType2) => (ProjectionType2[ProjectionType2.Perspective = 0] = "Perspective", ProjectionType2[ProjectionType2.Orthographic = 1] = "Orthographic", ProjectionType2))(ProjectionType || {});
var LightType = ((LightType2) => (LightType2[LightType2.Point = 0] = "Point", LightType2[LightType2.Spot = 1] = "Spot", LightType2[LightType2.Sun = 2] = "Sun", LightType2))(LightType || {});
var AnimationState = ((AnimationState2) => (AnimationState2[AnimationState2.Playing = 0] = "Playing", AnimationState2[AnimationState2.Paused = 1] = "Paused", AnimationState2[AnimationState2.Stopped = 2] = "Stopped", AnimationState2))(AnimationState || {});
var RootMotionMode = ((RootMotionMode2) => (RootMotionMode2[RootMotionMode2.None = 0] = "None", RootMotionMode2[RootMotionMode2.ApplyToOwner = 1] = "ApplyToOwner", RootMotionMode2[RootMotionMode2.Script = 2] = "Script", RootMotionMode2))(RootMotionMode || {});
var ForceMode = ((ForceMode2) => (ForceMode2[ForceMode2.Force = 0] = "Force", ForceMode2[ForceMode2.Impulse = 1] = "Impulse", ForceMode2[ForceMode2.VelocityChange = 2] = "VelocityChange", ForceMode2[ForceMode2.Acceleration = 3] = "Acceleration", ForceMode2))(ForceMode || {});
var CollisionEventType = ((CollisionEventType2) => (CollisionEventType2[CollisionEventType2.Touch = 0] = "Touch", CollisionEventType2[CollisionEventType2.TouchLost = 1] = "TouchLost", CollisionEventType2[CollisionEventType2.TriggerTouch = 2] = "TriggerTouch", CollisionEventType2[CollisionEventType2.TriggerTouchLost = 3] = "TriggerTouchLost", CollisionEventType2))(CollisionEventType || {});
var Shape = ((Shape2) => (Shape2[Shape2.None = 0] = "None", Shape2[Shape2.Sphere = 1] = "Sphere", Shape2[Shape2.Capsule = 2] = "Capsule", Shape2[Shape2.Box = 3] = "Box", Shape2[Shape2.Plane = 4] = "Plane", Shape2[Shape2.ConvexMesh = 5] = "ConvexMesh", Shape2[Shape2.TriangleMesh = 6] = "TriangleMesh", Shape2))(Shape || {});
var MeshAttribute = ((MeshAttribute2) => (MeshAttribute2[MeshAttribute2.Position = 0] = "Position", MeshAttribute2[MeshAttribute2.Tangent = 1] = "Tangent", MeshAttribute2[MeshAttribute2.Normal = 2] = "Normal", MeshAttribute2[MeshAttribute2.TextureCoordinate = 3] = "TextureCoordinate", MeshAttribute2[MeshAttribute2.Color = 4] = "Color", MeshAttribute2[MeshAttribute2.JointId = 5] = "JointId", MeshAttribute2[MeshAttribute2.JointWeight = 6] = "JointWeight", MeshAttribute2[MeshAttribute2.SecondaryTextureCoordinate = 7] = "SecondaryTextureCoordinate", MeshAttribute2))(MeshAttribute || {});
var GraphicsApi = ((GraphicsApi2) => (GraphicsApi2[GraphicsApi2.WebGL2 = 0] = "WebGL2", GraphicsApi2[GraphicsApi2.WebGPU = 1] = "WebGPU", GraphicsApi2))(GraphicsApi || {});
function isMeshShape(shape) {
  return shape === 5 || shape === 6;
}
function isBaseComponentClass(value) {
  return !!value && value.hasOwnProperty("_isBaseComponent") && value._isBaseComponent;
}
var UP_VECTOR = [0, 1, 0];
var SQRT_3 = Math.sqrt(3);
var _a;
var Component3 = (_a = class {
  static _pack(scene, id) {
    return scene << 22 | id;
  }
  static _inheritProperties() {
    inheritProperties(this);
  }
  _manager;
  _id;
  _localId;
  _object;
  _indexInSystem = null;
  _scene;
  constructor(scene, manager = -1, id = -1) {
    this._scene = scene, this._manager = manager, this._localId = id, this._id = _a._pack(scene._index, id), this._object = null;
  }
  get scene() {
    return this._scene;
  }
  get engine() {
    return this._scene.engine;
  }
  get type() {
    return this.constructor.TypeName;
  }
  get object() {
    if (!this._object) {
      let objectId = this.engine.wasm._wl_component_get_object(this._manager, this._id);
      this._object = this._scene.wrap(objectId);
    }
    return this._object;
  }
  set active(active) {
    this.engine.wasm._wl_component_setActive(this._manager, this._id, active);
  }
  get active() {
    return this.markedActive && this._scene.isActive;
  }
  get markedActive() {
    return this.engine.wasm._wl_component_isActive(this._manager, this._id) != 0;
  }
  copy(src) {
    let properties = this.constructor.Properties;
    if (!properties)
      return this;
    for (let name in properties) {
      let property2 = properties[name], value = src[name];
      if (value === void 0)
        continue;
      let cloner = property2.cloner ?? defaultPropertyCloner;
      this[name] = cloner.clone(property2.type, value);
    }
    return this;
  }
  destroy() {
    let manager = this._manager;
    manager < 0 || this._id < 0 || this.engine.wasm._wl_component_remove(manager, this._id);
  }
  equals(otherComponent) {
    return otherComponent ? this._manager === otherComponent._manager && this._id === otherComponent._id : false;
  }
  resetProperties() {
    return resetComponentProperties(this), this;
  }
  reset() {
    return this.resetProperties();
  }
  validateProperties() {
    let ctor = this.constructor;
    if (ctor.Properties) {
      for (let name in ctor.Properties)
        if (ctor.Properties[name].required && !this[name])
          throw new Error(`Property '${name}' is required but was not initialized`);
    }
  }
  toString() {
    return this.isDestroyed ? "Component(destroyed)" : `Component('${this.type}', ${this._localId})`;
  }
  get isDestroyed() {
    return this._id < 0;
  }
  _copy(src, offsetsPtr, copyInfoPtr) {
    let wasm = this.engine.wasm, offsets = wasm.HEAPU32, offsetsStart = offsetsPtr >>> 2, copyInfoStart = copyInfoPtr >>> 1, srcRootIndex = wasm.HEAPU16[copyInfoStart], srcRootSize = wasm.HEAPU16[copyInfoStart + 1], dstRootIndex = wasm.HEAPU16[copyInfoStart + 2], destScene = this._scene, ctor = this.constructor;
    for (let name in ctor.Properties) {
      let value = src[name];
      if (value === null) {
        this[name] = null;
        continue;
      }
      let prop = ctor.Properties[name], offset2 = offsets[offsetsStart + prop.type], retargeted = null;
      switch (prop.type) {
        case 6: {
          let index = wasm._wl_object_index(value._id) + offset2, dist2 = index - srcRootIndex;
          dist2 >= 0 && dist2 <= srcRootSize && (index = dstRootIndex + dist2);
          let id = wasm._wl_object_id(destScene._index, index);
          retargeted = destScene.wrap(id);
          break;
        }
        case 10:
          retargeted = destScene.animations.wrap(offset2 + value._index);
          break;
        case 11:
          retargeted = destScene.skins.wrap(offset2 + value._index);
          break;
        default:
          retargeted = (prop.cloner ?? defaultPropertyCloner).clone(prop.type, value);
          break;
      }
      this[name] = retargeted;
    }
    return this;
  }
  _triggerInit() {
    if (this.init)
      try {
        this.init();
      } catch (e) {
        this.engine.log.error(2, `Exception during ${this.type} init() on object ${this.object.name}`), this.engine.log.error(2, e);
      }
    let oldActivate = this.onActivate;
    this.onActivate = function() {
      this.onActivate = oldActivate;
      let failed = false;
      try {
        this.validateProperties();
      } catch (e) {
        this.engine.log.error(2, `Exception during ${this.type} validateProperties() on object ${this.object.name}`), this.engine.log.error(2, e), failed = true;
      }
      try {
        this.start?.();
      } catch (e) {
        this.engine.log.error(2, `Exception during ${this.type} start() on object ${this.object.name}`), this.engine.log.error(2, e), failed = true;
      }
      if (failed) {
        this.active = false;
        return;
      }
      if (this.onActivate)
        try {
          this.onActivate();
        } catch (e) {
          this.engine.log.error(2, `Exception during ${this.type} onActivate() on object ${this.object.name}`), this.engine.log.error(2, e);
        }
    };
  }
  _triggerUpdate(dt) {
    if (this.update)
      try {
        this.update(dt);
      } catch (e) {
        this.engine.log.error(2, `Exception during ${this.type} update() on object ${this.object.name}`), this.engine.log.error(2, e), this.engine.wasm._deactivate_component_on_error && (this.active = false);
      }
  }
  _triggerOnActivate() {
    if (this.onActivate)
      try {
        this.onActivate();
      } catch (e) {
        this.engine.log.error(2, `Exception during ${this.type} onActivate() on object ${this.object.name}`), this.engine.log.error(2, e);
      }
  }
  _triggerOnDeactivate() {
    if (this.onDeactivate)
      try {
        this.onDeactivate();
      } catch (e) {
        this.engine.log.error(2, `Exception during ${this.type} onDeactivate() on object ${this.object.name}`), this.engine.log.error(2, e);
      }
  }
  _triggerOnDestroy() {
    try {
      this.onDestroy && this.onDestroy();
    } catch (e) {
      this.engine.log.error(2, `Exception during ${this.type} onDestroy() on object ${this.object.name}`), this.engine.log.error(2, e);
    }
    this._scene._components.destroy(this);
  }
}, __publicField(_a, "_isBaseComponent", true), __publicField(_a, "_propertyOrder", []), __publicField(_a, "TypeName"), __publicField(_a, "Properties"), __publicField(_a, "InheritProperties"), __publicField(_a, "onRegister"), __publicField(_a, "UpdateAfter"), __publicField(_a, "UpdateBefore"), _a);
var _a2;
var BrokenComponent = (_a2 = class extends Component3 {
}, __publicField(_a2, "TypeName", "__broken-component__"), _a2);
function inheritProperties(target) {
  let chain = [], curr = target;
  for (; curr && !isBaseComponentClass(curr); ) {
    let comp = curr;
    if (!(comp.hasOwnProperty("InheritProperties") ? comp.InheritProperties : true))
      break;
    comp.hasOwnProperty("Properties") && chain.push(comp), curr = Object.getPrototypeOf(curr);
  }
  if (!chain.length || chain.length === 1 && chain[0] === target)
    return;
  let merged = {};
  for (let i = chain.length - 1; i >= 0; --i)
    Object.assign(merged, chain[i].Properties);
  target.Properties = merged;
}
var _a3;
var CollisionComponent = (_a3 = class extends Component3 {
  getExtents(out = new Float32Array(3)) {
    let wasm = this.engine.wasm, ptr = wasm._wl_collision_component_get_extents(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out;
  }
  get collider() {
    return this.engine.wasm._wl_collision_component_get_collider(this._id);
  }
  set collider(collider) {
    this.engine.wasm._wl_collision_component_set_collider(this._id, collider);
  }
  get extents() {
    let wasm = this.engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_collision_component_get_extents(this._id), 3);
  }
  set extents(extents) {
    let wasm = this.engine.wasm, ptr = wasm._wl_collision_component_get_extents(this._id) / 4;
    wasm.HEAPF32[ptr] = extents[0], wasm.HEAPF32[ptr + 1] = extents[1], wasm.HEAPF32[ptr + 2] = extents[2];
  }
  get radius() {
    let wasm = this.engine.wasm;
    if (this.collider === 0)
      return wasm.HEAPF32[wasm._wl_collision_component_get_extents(this._id) >> 2];
    let extents = new Float32Array(wasm.HEAPF32.buffer, wasm._wl_collision_component_get_extents(this._id), 3), x2 = extents[0] * extents[0], y2 = extents[1] * extents[1], z2 = extents[2] * extents[2];
    return Math.sqrt(x2 + y2 + z2) / 2;
  }
  set radius(radius) {
    let length5 = this.collider === 0 ? radius : 2 * radius / SQRT_3;
    this.extents.set([length5, length5, length5]);
  }
  get group() {
    return this.engine.wasm._wl_collision_component_get_group(this._id);
  }
  set group(group) {
    this.engine.wasm._wl_collision_component_set_group(this._id, group);
  }
  set visualize(b) {
    this.engine.wasm._wl_collision_component_set_visualize(this._id, b);
  }
  get visualize() {
    return !!this.engine.wasm._wl_collision_component_get_visualize(this._id);
  }
  queryOverlaps() {
    let count = this.engine.wasm._wl_collision_component_query_overlaps(this._id, this.engine.wasm._tempMem, this.engine.wasm._tempMemSize >> 1), overlaps = new Array(count);
    for (let i = 0; i < count; ++i) {
      let id = this.engine.wasm._tempMemUint16[i];
      overlaps[i] = this._scene._components.wrapCollision(id);
    }
    return overlaps;
  }
}, __publicField(_a3, "TypeName", "collision"), _a3);
__decorateClass2([nativeProperty()], CollisionComponent.prototype, "collider", 1), __decorateClass2([nativeProperty()], CollisionComponent.prototype, "extents", 1), __decorateClass2([nativeProperty()], CollisionComponent.prototype, "group", 1), __decorateClass2([nativeProperty()], CollisionComponent.prototype, "visualize", 1);
var _a4;
var TextComponent = (_a4 = class extends Component3 {
  get alignment() {
    return this.engine.wasm._wl_text_component_get_horizontal_alignment(this._id);
  }
  set alignment(alignment) {
    this.engine.wasm._wl_text_component_set_horizontal_alignment(this._id, alignment);
  }
  get verticalAlignment() {
    return this.engine.wasm._wl_text_component_get_vertical_alignment(this._id);
  }
  set verticalAlignment(verticalAlignment) {
    this.engine.wasm._wl_text_component_set_vertical_alignment(this._id, verticalAlignment);
  }
  get justification() {
    return this.verticalAlignment;
  }
  set justification(justification) {
    this.verticalAlignment = justification;
  }
  get justified() {
    return !!this.engine.wasm._wl_text_component_get_justified(this._id);
  }
  set justified(justified) {
    this.engine.wasm._wl_text_component_set_justified(this._id, justified);
  }
  get characterSpacing() {
    return this.engine.wasm._wl_text_component_get_character_spacing(this._id);
  }
  set characterSpacing(spacing) {
    this.engine.wasm._wl_text_component_set_character_spacing(this._id, spacing);
  }
  get lineSpacing() {
    return this.engine.wasm._wl_text_component_get_line_spacing(this._id);
  }
  set lineSpacing(spacing) {
    this.engine.wasm._wl_text_component_set_line_spacing(this._id, spacing);
  }
  get effect() {
    return this.engine.wasm._wl_text_component_get_effect(this._id);
  }
  set effect(effect) {
    this.engine.wasm._wl_text_component_set_effect(this._id, effect);
  }
  get effectOffset() {
    return this.getEffectOffset();
  }
  set effectOffset(offset2) {
    this.setEffectOffset(offset2);
  }
  getEffectOffset(out = new Float32Array(2)) {
    let wasm = this.engine.wasm;
    return wasm._wl_text_component_get_effectOffset(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out;
  }
  setEffectOffset(offset2) {
    let wasm = this.engine.wasm;
    wasm._tempMemFloat.set(offset2), wasm._wl_text_component_set_effectOffset(this._id, wasm._tempMem);
  }
  get wrapMode() {
    return this.engine.wasm._wl_text_component_get_wrapMode(this._id);
  }
  set wrapMode(wrapMode) {
    this.engine.wasm._wl_text_component_set_wrapMode(this._id, wrapMode);
  }
  get wrapWidth() {
    return this.engine.wasm._wl_text_component_get_wrapWidth(this._id);
  }
  set wrapWidth(width) {
    this.engine.wasm._wl_text_component_set_wrapWidth(this._id, width);
  }
  get text() {
    let wasm = this.engine.wasm, ptr = wasm._wl_text_component_get_text(this._id);
    return wasm.UTF8ToString(ptr);
  }
  set text(text) {
    let wasm = this.engine.wasm;
    wasm._wl_text_component_set_text(this._id, wasm.tempUTF8(text.toString()));
  }
  set material(material) {
    let matIndex = material ? material._id : 0;
    this.engine.wasm._wl_text_component_set_material(this._id, matIndex);
  }
  get material() {
    let index = this.engine.wasm._wl_text_component_get_material(this._id);
    return this.engine.materials.wrap(index);
  }
  getBoundingBoxForText(text, out = new Float32Array(4)) {
    let wasm = this.engine.wasm, textPtr = wasm.tempUTF8(text, 4 * 4);
    return this.engine.wasm._wl_text_component_get_boundingBox(this._id, textPtr, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out[3] = wasm._tempMemFloat[3], out;
  }
  getBoundingBox(out = new Float32Array(4)) {
    let wasm = this.engine.wasm;
    return this.engine.wasm._wl_text_component_get_boundingBox(this._id, 0, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out[3] = wasm._tempMemFloat[3], out;
  }
}, __publicField(_a4, "TypeName", "text"), _a4);
__decorateClass2([nativeProperty()], TextComponent.prototype, "alignment", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "verticalAlignment", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "justification", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "justified", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "characterSpacing", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "lineSpacing", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "effect", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "effectOffset", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "wrapMode", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "wrapWidth", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "text", 1), __decorateClass2([nativeProperty()], TextComponent.prototype, "material", 1);
var _a5;
var ViewComponent = (_a5 = class extends Component3 {
  get projectionType() {
    return this.engine.wasm._wl_view_component_get_projectionType(this._id);
  }
  set projectionType(type) {
    this.engine.wasm._wl_view_component_set_projectionType(this._id, type);
  }
  getProjectionMatrix(out = new Float32Array(16)) {
    let wasm = this.engine.wasm;
    wasm.requireTempMem(16 * 4), wasm._wl_view_component_get_projectionMatrix(this._id, wasm._tempMem);
    for (let i = 0; i < 16; ++i)
      out[i] = wasm._tempMemFloat[i];
    return out;
  }
  get projectionMatrix() {
    return this.getProjectionMatrix();
  }
  _setProjectionMatrix(v) {
    let wasm = this._scene.engine.wasm;
    wasm.requireTempMem(16 * 4), wasm._tempMemFloat.set(v), wasm._wl_view_component_set_projectionMatrix(this._id, wasm._tempMem);
  }
  _generateProjectionMatrix() {
    this._scene.engine.wasm._wl_view_component_generate_projectionMatrix(this._id);
  }
  get near() {
    return this.engine.wasm._wl_view_component_get_near(this._id);
  }
  set near(near) {
    this.engine.wasm._wl_view_component_set_near(this._id, near), this.engine.xr && this.scene.isActive && this.active && this.engine.webxr.updateProjectionParams(near, this.far);
  }
  get far() {
    return this.engine.wasm._wl_view_component_get_far(this._id);
  }
  set far(far) {
    this.engine.wasm._wl_view_component_set_far(this._id, far), this.engine.xr && this.scene.isActive && this.active && this.engine.webxr.updateProjectionParams(this.near, far);
  }
  get fov() {
    return this.engine.wasm._wl_view_component_get_fov(this._id);
  }
  set fov(fov) {
    this.engine.wasm._wl_view_component_set_fov(this._id, fov);
  }
  getViewport(out = new Int32Array(4)) {
    let wasm = this.engine.wasm, ptr = wasm._wl_view_component_get_viewport(this._id) / 4;
    for (let i = 0; i < 4; ++i)
      out[i] = wasm.HEAP32[ptr + i];
    return out;
  }
  get viewport() {
    return this.getViewport();
  }
  _setViewport(x, y, width, height) {
    this._scene.engine.wasm._wl_view_component_set_viewport(this._id, x, y, width, height);
  }
  get extent() {
    return this.engine.wasm._wl_view_component_get_extent(this._id);
  }
  set extent(extent) {
    this.engine.wasm._wl_view_component_set_extent(this._id, extent);
  }
  get exposure() {
    return this.engine.wasm._wl_view_component_get_exposure(this._id);
  }
  set exposure(exposure) {
    this.engine.wasm._wl_view_component_set_exposure(this._id, exposure);
  }
  getDirectionForScreenPosition(x, y, out = new Float32Array(3)) {
    let wasm = this.engine.wasm;
    return this.getViewport(wasm._tempMemInt), x = (x + 0.5) / Math.max(wasm._tempMemInt[2], 1), y = (y + 0.5) / Math.max(wasm._tempMemInt[3], 1), x = x * 2 - 1, y = -y * 2 + 1, wasm._wl_view_component_get_directionForScreenPosition(this._id, x, y, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
}, __publicField(_a5, "TypeName", "view"), _a5);
__decorateClass2([nativeProperty()], ViewComponent.prototype, "projectionType", 1), __decorateClass2([enumerable()], ViewComponent.prototype, "projectionMatrix", 1), __decorateClass2([nativeProperty()], ViewComponent.prototype, "near", 1), __decorateClass2([nativeProperty()], ViewComponent.prototype, "far", 1), __decorateClass2([nativeProperty()], ViewComponent.prototype, "fov", 1), __decorateClass2([enumerable()], ViewComponent.prototype, "viewport", 1), __decorateClass2([nativeProperty()], ViewComponent.prototype, "extent", 1), __decorateClass2([nativeProperty()], ViewComponent.prototype, "exposure", 1);
var _a6;
var InputComponent = (_a6 = class extends Component3 {
  get inputType() {
    return this.engine.wasm._wl_input_component_get_type(this._id);
  }
  set inputType(type) {
    this.engine.wasm._wl_input_component_set_type(this._id, type);
  }
  get xrInputSource() {
    let xr = this.engine.xr;
    if (!xr)
      return null;
    for (let inputSource of xr.session.inputSources)
      if (inputSource.handedness == this.handedness)
        return inputSource;
    return null;
  }
  get handedness() {
    let inputType = this.inputType;
    return inputType == 4 || inputType == 6 || inputType == 2 ? "right" : inputType == 3 || inputType == 5 || inputType == 1 ? "left" : null;
  }
}, __publicField(_a6, "TypeName", "input"), _a6);
__decorateClass2([nativeProperty()], InputComponent.prototype, "inputType", 1), __decorateClass2([enumerable()], InputComponent.prototype, "xrInputSource", 1), __decorateClass2([enumerable()], InputComponent.prototype, "handedness", 1);
var _a7;
var LightComponent = (_a7 = class extends Component3 {
  getColor(out = new Float32Array(3)) {
    let wasm = this.engine.wasm, ptr = wasm._wl_light_component_get_color(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out;
  }
  setColor(c) {
    let wasm = this.engine.wasm, ptr = wasm._wl_light_component_get_color(this._id) / 4;
    wasm.HEAPF32[ptr] = c[0], wasm.HEAPF32[ptr + 1] = c[1], wasm.HEAPF32[ptr + 2] = c[2];
  }
  get color() {
    let wasm = this.engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_light_component_get_color(this._id), 3);
  }
  set color(c) {
    this.color.set(c);
  }
  get lightType() {
    return this.engine.wasm._wl_light_component_get_type(this._id);
  }
  set lightType(t) {
    this.engine.wasm._wl_light_component_set_type(this._id, t);
  }
  get intensity() {
    return this.engine.wasm._wl_light_component_get_intensity(this._id);
  }
  set intensity(intensity) {
    this.engine.wasm._wl_light_component_set_intensity(this._id, intensity);
  }
  get outerAngle() {
    return this.engine.wasm._wl_light_component_get_outerAngle(this._id);
  }
  set outerAngle(angle2) {
    this.engine.wasm._wl_light_component_set_outerAngle(this._id, angle2);
  }
  get innerAngle() {
    return this.engine.wasm._wl_light_component_get_innerAngle(this._id);
  }
  set innerAngle(angle2) {
    this.engine.wasm._wl_light_component_set_innerAngle(this._id, angle2);
  }
  get shadows() {
    return !!this.engine.wasm._wl_light_component_get_shadows(this._id);
  }
  set shadows(b) {
    this.engine.wasm._wl_light_component_set_shadows(this._id, b);
  }
  get shadowRange() {
    return this.engine.wasm._wl_light_component_get_shadowRange(this._id);
  }
  set shadowRange(range) {
    this.engine.wasm._wl_light_component_set_shadowRange(this._id, range);
  }
  get shadowBias() {
    return this.engine.wasm._wl_light_component_get_shadowBias(this._id);
  }
  set shadowBias(bias) {
    this.engine.wasm._wl_light_component_set_shadowBias(this._id, bias);
  }
  get shadowNormalBias() {
    return this.engine.wasm._wl_light_component_get_shadowNormalBias(this._id);
  }
  set shadowNormalBias(bias) {
    this.engine.wasm._wl_light_component_set_shadowNormalBias(this._id, bias);
  }
  get shadowTexelSize() {
    return this.engine.wasm._wl_light_component_get_shadowTexelSize(this._id);
  }
  set shadowTexelSize(size) {
    this.engine.wasm._wl_light_component_set_shadowTexelSize(this._id, size);
  }
  get cascadeCount() {
    return this.engine.wasm._wl_light_component_get_cascadeCount(this._id);
  }
  set cascadeCount(count) {
    this.engine.wasm._wl_light_component_set_cascadeCount(this._id, count);
  }
}, __publicField(_a7, "TypeName", "light"), _a7);
__decorateClass2([nativeProperty()], LightComponent.prototype, "color", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "lightType", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "intensity", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "outerAngle", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "innerAngle", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "shadows", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "shadowRange", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "shadowBias", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "shadowNormalBias", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "shadowTexelSize", 1), __decorateClass2([nativeProperty()], LightComponent.prototype, "cascadeCount", 1);
var _a8;
var AnimationComponent = (_a8 = class extends Component3 {
  onEvent = new Emitter();
  set animation(anim) {
    if (this.scene.assertOrigin(anim), anim instanceof AnimationGraph) {
      this.animationGraph = anim;
      return;
    }
    this.engine.wasm._wl_animation_component_set_animation(this._id, anim ? anim._id : 0);
  }
  get animation() {
    let index = this.engine.wasm._wl_animation_component_get_animation(this._id);
    return this._scene.animations.wrap(index);
  }
  get animationGraph() {
    let index = this.engine.wasm._wl_animation_component_get_animationGraph(this._id);
    return this.scene.animationsGraphs.wrap(index);
  }
  set animationGraph(graph) {
    this.engine.wasm._wl_animation_component_set_animationGraph(this._id, graph ? graph._id : 0);
  }
  set playCount(playCount) {
    this.engine.wasm._wl_animation_component_set_playCount(this._id, playCount);
  }
  get playCount() {
    return this.engine.wasm._wl_animation_component_get_playCount(this._id);
  }
  set speed(speed) {
    this.engine.wasm._wl_animation_component_set_speed(this._id, speed);
  }
  get speed() {
    return this.engine.wasm._wl_animation_component_get_speed(this._id);
  }
  get state() {
    return this.engine.wasm._wl_animation_component_state(this._id);
  }
  get rootMotionMode() {
    return this.engine.wasm._wl_animation_component_get_rootMotionMode(this._id);
  }
  set rootMotionMode(mode) {
    this.engine.wasm._wl_animation_component_set_rootMotionMode(this._id, mode);
  }
  get iteration() {
    return this.engine.wasm._wl_animation_component_get_iteration(this._id);
  }
  get position() {
    return this.engine.wasm._wl_animation_component_get_position(this._id);
  }
  get duration() {
    return this.engine.wasm._wl_animation_component_get_duration(this._id);
  }
  play() {
    this.engine.wasm._wl_animation_component_play(this._id);
  }
  stop() {
    this.engine.wasm._wl_animation_component_stop(this._id);
  }
  pause() {
    this.engine.wasm._wl_animation_component_pause(this._id);
  }
  getFloatParameter(name) {
    let wasm = this.engine.wasm, index = wasm._wl_animation_component_getGraphParamIndex(this._id, wasm.tempUTF8(name));
    if (index === -1)
      throw Error(`Missing parameter '${name}'`);
    return wasm._wl_animation_component_getGraphParamValue(this._id, index, wasm._tempMem), wasm._tempMemFloat[0];
  }
  setFloatParameter(name, value) {
    let wasm = this.engine.wasm, index = wasm._wl_animation_component_getGraphParamIndex(this._id, wasm.tempUTF8(name));
    if (index === -1)
      throw Error(`Missing parameter '${name}'`);
    wasm._tempMemFloat[0] = value, wasm._wl_animation_component_setGraphParamValue(this._id, index, wasm._tempMem);
  }
  getRootMotionTranslation(out = new Float32Array(3)) {
    let wasm = this.engine.wasm;
    return wasm._wl_animation_component_get_rootMotion_translation(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  getRootMotionRotation(out = new Float32Array(3)) {
    let wasm = this.engine.wasm;
    return wasm._wl_animation_component_get_rootMotion_rotation(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
}, __publicField(_a8, "TypeName", "animation"), _a8);
__decorateClass2([nativeProperty()], AnimationComponent.prototype, "animation", 1), __decorateClass2([nativeProperty()], AnimationComponent.prototype, "animationGraph", 1), __decorateClass2([nativeProperty()], AnimationComponent.prototype, "playCount", 1), __decorateClass2([nativeProperty()], AnimationComponent.prototype, "speed", 1), __decorateClass2([enumerable()], AnimationComponent.prototype, "state", 1), __decorateClass2([nativeProperty()], AnimationComponent.prototype, "rootMotionMode", 1);
var _a9;
var MeshComponent = (_a9 = class extends Component3 {
  set material(material) {
    this.engine.wasm._wl_mesh_component_set_material(this._id, material ? material._id : 0);
  }
  get material() {
    let index = this.engine.wasm._wl_mesh_component_get_material(this._id);
    return this.engine.materials.wrap(index);
  }
  get mesh() {
    let index = this.engine.wasm._wl_mesh_component_get_mesh(this._id);
    return this.engine.meshes.wrap(index);
  }
  set mesh(mesh) {
    this.engine.wasm._wl_mesh_component_set_mesh(this._id, mesh?._id ?? 0);
  }
  get skin() {
    let index = this.engine.wasm._wl_mesh_component_get_skin(this._id);
    return this._scene.skins.wrap(index);
  }
  set skin(skin) {
    this.scene.assertOrigin(skin), this.engine.wasm._wl_mesh_component_set_skin(this._id, skin ? skin._id : 0);
  }
  get morphTargets() {
    let index = this.engine.wasm._wl_mesh_component_get_morph_targets(this._id);
    return this.engine.morphTargets.wrap(index);
  }
  set morphTargets(morphTargets) {
    this.engine.wasm._wl_mesh_component_set_morph_targets(this._id, morphTargets?._id ?? 0);
  }
  get morphTargetWeights() {
    return this.getMorphTargetWeights();
  }
  set morphTargetWeights(weights) {
    this.setMorphTargetWeights(weights);
  }
  getMorphTargetWeights(out) {
    let wasm = this.engine.wasm, count = wasm._wl_mesh_component_get_morph_target_weights(this._id, wasm._tempMem);
    out || (out = new Float32Array(count));
    for (let i = 0; i < count; ++i)
      out[i] = wasm._tempMemFloat[i];
    return out;
  }
  getMorphTargetWeight(target) {
    let count = this.morphTargets?.count ?? 0;
    if (target >= count)
      throw new Error(`Index ${target} is out of bounds for ${count} targets`);
    return this.engine.wasm._wl_mesh_component_get_morph_target_weight(this._id, target);
  }
  setMorphTargetWeights(weights) {
    let count = this.morphTargets?.count ?? 0;
    if (weights.length !== count)
      throw new Error(`Expected ${count} weights but got ${weights.length}`);
    let wasm = this.engine.wasm;
    wasm._tempMemFloat.set(weights), wasm._wl_mesh_component_set_morph_target_weights(this._id, wasm._tempMem, weights.length);
  }
  setMorphTargetWeight(target, weight) {
    let count = this.morphTargets?.count ?? 0;
    if (target >= count)
      throw new Error(`Index ${target} is out of bounds for ${count} targets`);
    this.engine.wasm._wl_mesh_component_set_morph_target_weight(this._id, target, weight);
  }
}, __publicField(_a9, "TypeName", "mesh"), _a9);
__decorateClass2([nativeProperty()], MeshComponent.prototype, "material", 1), __decorateClass2([nativeProperty()], MeshComponent.prototype, "mesh", 1), __decorateClass2([nativeProperty()], MeshComponent.prototype, "skin", 1), __decorateClass2([nativeProperty()], MeshComponent.prototype, "morphTargets", 1), __decorateClass2([nativeProperty()], MeshComponent.prototype, "morphTargetWeights", 1);
var ParticleReplacementPolicy = ((ParticleReplacementPolicy2) => (ParticleReplacementPolicy2[ParticleReplacementPolicy2.DontReplace = 0] = "DontReplace", ParticleReplacementPolicy2[ParticleReplacementPolicy2.ReplaceOldest = 1] = "ReplaceOldest", ParticleReplacementPolicy2))(ParticleReplacementPolicy || {});
var _a10;
var ParticleEffectComponent = (_a10 = class extends Component3 {
  get particleEffect() {
    let index = this.engine.wasm._wl_particleEffect_component_get_particleEffect(this._id);
    return this.engine.particleEffects.wrap(index);
  }
  set particleEffect(particleEffect) {
    this.engine.wasm._wl_particleEffect_component_set_particleEffect(this._id, particleEffect?._id ?? 0);
  }
  spawn(count = 1, lifetime = 0, replacementPolicy = 0) {
    if (lifetime ??= 0, count < 0)
      throw new Error("Particle count must be non-negative");
    if (lifetime < 0)
      throw new Error("Particle lifetime must be non-negative");
    return this.engine.wasm._wl_particleEffect_component_spawnParticles(this._id, count, lifetime, replacementPolicy);
  }
  get aliveCount() {
    return this.engine.wasm._wl_particleEffect_component_aliveCount(this._id);
  }
  get ids() {
    let offset2 = this.engine.wasm._wl_particleEffect_component_get_ids(this._id);
    return offset2 ? new Uint16Array(this.engine.wasm.HEAPU16.buffer, offset2, this.particleEffect.maxCount) : null;
  }
  get transforms() {
    let offset2 = this.engine.wasm._wl_particleEffect_component_get_transforms(this._id);
    return offset2 ? new AttributeAccessor(this.engine, { attribute: 0, offset: offset2, stride: 4 * 8, formatSize: 4 * 8, componentCount: 8, arraySize: 1, length: this.particleEffect.maxCount, bufferType: Float32Array }) : null;
  }
  get scalings() {
    let offset2 = this.engine.wasm._wl_particleEffect_component_get_scalings(this._id);
    return offset2 ? new AttributeAccessor(this.engine, { attribute: 0, offset: offset2, stride: 4 * 3, formatSize: 4 * 3, componentCount: 3, arraySize: 1, length: this.particleEffect.maxCount, bufferType: Float32Array }) : null;
  }
  get lifetimes() {
    let offset2 = this.engine.wasm._wl_particleEffect_component_get_lifetimes(this._id);
    return offset2 ? new AttributeAccessor(this.engine, { attribute: 0, offset: offset2, stride: 4 * 2, formatSize: 4 * 2, componentCount: 2, arraySize: 1, length: this.particleEffect.maxCount, bufferType: Float32Array }) : null;
  }
  get colors() {
    let offset2 = this.engine.wasm._wl_particleEffect_component_get_colors(this._id);
    return offset2 ? new AttributeAccessor(this.engine, { attribute: 0, offset: offset2, stride: 4 * 4, formatSize: 4 * 4, componentCount: 4, arraySize: 1, length: this.particleEffect.maxCount, bufferType: Float32Array }) : null;
  }
  get instanceData() {
    let offset2 = this.engine.wasm._wl_particleEffect_component_get_instanceData(this._id);
    return offset2 ? new AttributeAccessor(this.engine, { attribute: 0, offset: offset2, stride: 4 * 4, formatSize: 4 * 4, componentCount: 4, arraySize: 1, length: this.particleEffect.maxCount, bufferType: Float32Array }) : null;
  }
  update(count) {
    this.engine.wasm._wl_particleEffect_component_update(this._id, count);
  }
}, __publicField(_a10, "TypeName", "particle-effect"), _a10);
__decorateClass2([nativeProperty()], ParticleEffectComponent.prototype, "particleEffect", 1);
var LockAxis = ((LockAxis2) => (LockAxis2[LockAxis2.None = 0] = "None", LockAxis2[LockAxis2.X = 1] = "X", LockAxis2[LockAxis2.Y = 2] = "Y", LockAxis2[LockAxis2.Z = 4] = "Z", LockAxis2))(LockAxis || {});
var _a11;
var PhysXComponent = (_a11 = class extends Component3 {
  getTranslationOffset(out = new Float32Array(3)) {
    let wasm = this.engine.wasm;
    return wasm._wl_physx_component_get_offsetTranslation(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  getRotationOffset(out = new Float32Array(4)) {
    let wasm = this.engine.wasm, ptr = wasm._wl_physx_component_get_offsetTransform(this._id) >> 2;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out[3] = wasm.HEAPF32[ptr + 3], out;
  }
  getExtents(out = new Float32Array(3)) {
    let wasm = this.engine.wasm, ptr = wasm._wl_physx_component_get_extents(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out;
  }
  getLinearVelocity(out = new Float32Array(3)) {
    let wasm = this.engine.wasm, tempMemFloat = wasm._tempMemFloat;
    return wasm._wl_physx_component_get_linearVelocity(this._id, wasm._tempMem), out[0] = tempMemFloat[0], out[1] = tempMemFloat[1], out[2] = tempMemFloat[2], out;
  }
  getAngularVelocity(out = new Float32Array(3)) {
    let wasm = this.engine.wasm, tempMemFloat = wasm._tempMemFloat;
    return wasm._wl_physx_component_get_angularVelocity(this._id, wasm._tempMem), out[0] = tempMemFloat[0], out[1] = tempMemFloat[1], out[2] = tempMemFloat[2], out;
  }
  set static(b) {
    this.engine.wasm._wl_physx_component_set_static(this._id, b);
  }
  get static() {
    return !!this.engine.wasm._wl_physx_component_get_static(this._id);
  }
  get translationOffset() {
    return this.getTranslationOffset();
  }
  set translationOffset(offset2) {
    this.engine.wasm._wl_physx_component_set_offsetTranslation(this._id, offset2[0], offset2[1], offset2[2]);
  }
  get rotationOffset() {
    return this.getRotationOffset();
  }
  set rotationOffset(offset2) {
    this.engine.wasm._wl_physx_component_set_offsetRotation(this._id, offset2[0], offset2[1], offset2[2], offset2[3]);
  }
  set kinematic(b) {
    this.engine.wasm._wl_physx_component_set_kinematic(this._id, b);
  }
  get kinematic() {
    return !!this.engine.wasm._wl_physx_component_get_kinematic(this._id);
  }
  set gravity(b) {
    this.engine.wasm._wl_physx_component_set_gravity(this._id, b);
  }
  get gravity() {
    return !!this.engine.wasm._wl_physx_component_get_gravity(this._id);
  }
  set simulate(b) {
    this.engine.wasm._wl_physx_component_set_simulate(this._id, b);
  }
  get simulate() {
    return !!this.engine.wasm._wl_physx_component_get_simulate(this._id);
  }
  set allowSimulation(b) {
    this.engine.wasm._wl_physx_component_set_allowSimulation(this._id, b);
  }
  get allowSimulation() {
    return !!this.engine.wasm._wl_physx_component_get_allowSimulation(this._id);
  }
  set allowQuery(b) {
    this.engine.wasm._wl_physx_component_set_allowQuery(this._id, b);
  }
  get allowQuery() {
    return !!this.engine.wasm._wl_physx_component_get_allowQuery(this._id);
  }
  set trigger(b) {
    this.engine.wasm._wl_physx_component_set_trigger(this._id, b);
  }
  get trigger() {
    return !!this.engine.wasm._wl_physx_component_get_trigger(this._id);
  }
  set visualize(b) {
    this.engine.wasm._wl_physx_component_set_visualize(this._id, b);
  }
  get visualize() {
    return !!this.engine.wasm._wl_physx_component_get_visualize(this._id);
  }
  set shape(s) {
    this.engine.wasm._wl_physx_component_set_shape(this._id, s);
  }
  get shape() {
    return this.engine.wasm._wl_physx_component_get_shape(this._id);
  }
  set shapeData(d) {
    d == null || !isMeshShape(this.shape) || this.engine.wasm._wl_physx_component_set_shape_data(this._id, d.index);
  }
  get shapeData() {
    return isMeshShape(this.shape) ? { index: this.engine.wasm._wl_physx_component_get_shape_data(this._id) } : null;
  }
  set extents(e) {
    this.extents.set(e);
  }
  get extents() {
    let wasm = this.engine.wasm, ptr = wasm._wl_physx_component_get_extents(this._id);
    return new Float32Array(wasm.HEAPF32.buffer, ptr, 3);
  }
  get staticFriction() {
    return this.engine.wasm._wl_physx_component_get_staticFriction(this._id);
  }
  set staticFriction(v) {
    this.engine.wasm._wl_physx_component_set_staticFriction(this._id, v);
  }
  get dynamicFriction() {
    return this.engine.wasm._wl_physx_component_get_dynamicFriction(this._id);
  }
  set dynamicFriction(v) {
    this.engine.wasm._wl_physx_component_set_dynamicFriction(this._id, v);
  }
  get bounciness() {
    return this.engine.wasm._wl_physx_component_get_bounciness(this._id);
  }
  set bounciness(v) {
    this.engine.wasm._wl_physx_component_set_bounciness(this._id, v);
  }
  get linearDamping() {
    return this.engine.wasm._wl_physx_component_get_linearDamping(this._id);
  }
  set linearDamping(v) {
    this.engine.wasm._wl_physx_component_set_linearDamping(this._id, v);
  }
  get angularDamping() {
    return this.engine.wasm._wl_physx_component_get_angularDamping(this._id);
  }
  set angularDamping(v) {
    this.engine.wasm._wl_physx_component_set_angularDamping(this._id, v);
  }
  set linearVelocity(v) {
    this.engine.wasm._wl_physx_component_set_linearVelocity(this._id, v[0], v[1], v[2]);
  }
  get linearVelocity() {
    let wasm = this.engine.wasm;
    return wasm._wl_physx_component_get_linearVelocity(this._id, wasm._tempMem), new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, 3);
  }
  set angularVelocity(v) {
    this.engine.wasm._wl_physx_component_set_angularVelocity(this._id, v[0], v[1], v[2]);
  }
  get angularVelocity() {
    let wasm = this.engine.wasm;
    return wasm._wl_physx_component_get_angularVelocity(this._id, wasm._tempMem), new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, 3);
  }
  set groupsMask(flags) {
    this.engine.wasm._wl_physx_component_set_groupsMask(this._id, flags);
  }
  get groupsMask() {
    return this.engine.wasm._wl_physx_component_get_groupsMask(this._id);
  }
  set blocksMask(flags) {
    this.engine.wasm._wl_physx_component_set_blocksMask(this._id, flags);
  }
  get blocksMask() {
    return this.engine.wasm._wl_physx_component_get_blocksMask(this._id);
  }
  set linearLockAxis(lock) {
    this.engine.wasm._wl_physx_component_set_linearLockAxis(this._id, lock);
  }
  get linearLockAxis() {
    return this.engine.wasm._wl_physx_component_get_linearLockAxis(this._id);
  }
  set angularLockAxis(lock) {
    this.engine.wasm._wl_physx_component_set_angularLockAxis(this._id, lock);
  }
  get angularLockAxis() {
    return this.engine.wasm._wl_physx_component_get_angularLockAxis(this._id);
  }
  set mass(m) {
    this.engine.wasm._wl_physx_component_set_mass(this._id, m);
  }
  get mass() {
    return this.engine.wasm._wl_physx_component_get_mass(this._id);
  }
  set massSpaceInertiaTensor(v) {
    this.engine.wasm._wl_physx_component_set_massSpaceInertiaTensor(this._id, v[0], v[1], v[2]);
  }
  set massSpaceInteriaTensor(v) {
    this.massSpaceInertiaTensor = v;
  }
  set sleepOnActivate(flag) {
    this.engine.wasm._wl_physx_component_set_sleepOnActivate(this._id, flag);
  }
  get sleepOnActivate() {
    return !!this.engine.wasm._wl_physx_component_get_sleepOnActivate(this._id);
  }
  addForce(f, m = 0, localForce = false, p, local = false) {
    let wasm = this.engine.wasm;
    if (!p) {
      wasm._wl_physx_component_addForce(this._id, f[0], f[1], f[2], m, localForce);
      return;
    }
    wasm._wl_physx_component_addForceAt(this._id, f[0], f[1], f[2], m, localForce, p[0], p[1], p[2], local);
  }
  addTorque(f, m = 0) {
    this.engine.wasm._wl_physx_component_addTorque(this._id, f[0], f[1], f[2], m);
  }
  onCollision(callback) {
    return this.onCollisionWith(this, callback);
  }
  onCollisionWith(otherComp, callback) {
    let callbacks = this.scene._pxCallbacks;
    return callbacks.has(this._id) || callbacks.set(this._id, []), callbacks.get(this._id).push(callback), this.engine.wasm._wl_physx_component_addCallback(this._id, otherComp._id);
  }
  removeCollisionCallback(callbackId) {
    let r = this.engine.wasm._wl_physx_component_removeCallback(this._id, callbackId), callbacks = this.scene._pxCallbacks;
    r && callbacks.get(this._id).splice(-r);
  }
}, __publicField(_a11, "TypeName", "physx"), _a11);
__decorateClass2([nativeProperty()], PhysXComponent.prototype, "static", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "translationOffset", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "rotationOffset", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "kinematic", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "gravity", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "simulate", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "allowSimulation", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "allowQuery", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "trigger", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "visualize", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "shape", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "shapeData", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "extents", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "staticFriction", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "dynamicFriction", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "bounciness", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "linearDamping", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "angularDamping", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "linearVelocity", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "angularVelocity", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "groupsMask", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "blocksMask", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "linearLockAxis", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "angularLockAxis", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "mass", 1), __decorateClass2([nativeProperty()], PhysXComponent.prototype, "sleepOnActivate", 1);
var Physics = class {
  _hit;
  _engine;
  _rayHit;
  constructor(engine2) {
    this._engine = engine2;
    let wasm = engine2.wasm;
    this._rayHit = wasm._malloc(4 * (3 * 4 + 3 * 4 + 4 + 2) + 4), this._hit = new RayHit(engine2.scene, this._rayHit), wasm._wl_physx_set_collision_callback(wasm.addFunction((a, index, type, b) => {
      let physxA = this._engine.scene._components.wrapPhysx(a), physxB = this._engine.scene._components.wrapPhysx(b), callback = this._engine.scene._pxCallbacks.get(physxA._id)[index];
      callback(type, physxB);
    }, "viiii"));
  }
  rayCast(o, d, groupMask, maxDistance = 100) {
    let scene = this._engine.scene._index;
    return this._engine.wasm._wl_physx_ray_cast(scene, o[0], o[1], o[2], d[0], d[1], d[2], groupMask, maxDistance, this._rayHit), this._hit;
  }
  get engine() {
    return this._engine;
  }
};
var MeshIndexType = ((MeshIndexType2) => (MeshIndexType2[MeshIndexType2.UnsignedByte = 1] = "UnsignedByte", MeshIndexType2[MeshIndexType2.UnsignedShort = 2] = "UnsignedShort", MeshIndexType2[MeshIndexType2.UnsignedInt = 4] = "UnsignedInt", MeshIndexType2))(MeshIndexType || {});
var MeshSkinningType = ((MeshSkinningType2) => (MeshSkinningType2[MeshSkinningType2.None = 0] = "None", MeshSkinningType2[MeshSkinningType2.FourJoints = 1] = "FourJoints", MeshSkinningType2[MeshSkinningType2.EightJoints = 2] = "EightJoints", MeshSkinningType2))(MeshSkinningType || {});
var Mesh = class extends Resource {
  static getResourceType() {
    return 2;
  }
  constructor(engine2, params) {
    if (!isNumber(params)) {
      let mesh = engine2.meshes.create(params);
      return super(engine2, mesh._index), mesh;
    }
    super(engine2, params);
  }
  get vertexCount() {
    return this.engine.wasm._wl_mesh_get_vertexCount(this._id);
  }
  get indexData() {
    let wasm = this.engine.wasm, tempMem = wasm._tempMem, ptr = wasm._wl_mesh_get_indexData(this._id, tempMem, tempMem + 4);
    if (ptr === null)
      return null;
    let indexCount = wasm.HEAPU32[tempMem / 4];
    switch (wasm.HEAPU32[tempMem / 4 + 1]) {
      case 1:
        return new Uint8Array(wasm.HEAPU8.buffer, ptr, indexCount);
      case 2:
        return new Uint16Array(wasm.HEAPU16.buffer, ptr, indexCount);
      case 4:
        return new Uint32Array(wasm.HEAPU32.buffer, ptr, indexCount);
    }
    return null;
  }
  update() {
    this.engine.wasm._wl_mesh_update(this._id);
  }
  getBoundingSphere(out = new Float32Array(4)) {
    let wasm = this.engine.wasm;
    return this.engine.wasm._wl_mesh_get_boundingSphere(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out[3] = wasm._tempMemFloat[3], out;
  }
  attribute(attr) {
    if (typeof attr != "number")
      throw new TypeError("Expected number, but got " + typeof attr);
    let wasm = this.engine.wasm, tempMemUint32 = wasm._tempMemUint32;
    if (wasm._wl_mesh_get_attribute(this._id, attr, wasm._tempMem), tempMemUint32[0] == 255)
      return null;
    let arraySize = tempMemUint32[5];
    return new AttributeAccessor(this.engine, { attribute: tempMemUint32[0], offset: tempMemUint32[1], stride: tempMemUint32[2], formatSize: tempMemUint32[3], componentCount: tempMemUint32[4], arraySize: arraySize || 1, length: this.vertexCount, bufferType: attr !== 5 ? Float32Array : Uint16Array });
  }
  destroy() {
    this.engine.wasm._wl_mesh_destroy(this._id), this.engine.meshes._destroy(this);
  }
  toString() {
    return this.isDestroyed ? "Mesh(destroyed)" : `Mesh(${this._index})`;
  }
};
var AttributeAccessor = class {
  length = 0;
  _engine;
  _attribute = -1;
  _offset = 0;
  _stride = 0;
  _formatSize = 0;
  _componentCount = 0;
  _arraySize = 1;
  _bufferType;
  _tempBufferGetter;
  constructor(engine2, options) {
    this._engine = engine2, this._attribute = options.attribute, this._offset = options.offset, this._stride = options.stride, this._formatSize = options.formatSize, this._componentCount = options.componentCount, this._arraySize = options.arraySize, this._bufferType = options.bufferType, this.length = options.length;
    let wasm = this._engine.wasm;
    this._tempBufferGetter = this._bufferType === Float32Array ? wasm.getTempBufferF32.bind(wasm) : wasm.getTempBufferU16.bind(wasm);
  }
  createArray(count = 1) {
    return count = count > this.length ? this.length : count, new this._bufferType(count * this._componentCount * this._arraySize);
  }
  get(index, out = this.createArray()) {
    if (out.length % this._componentCount !== 0)
      throw new Error(`out.length, ${out.length} is not a multiple of the attribute vector components, ${this._componentCount}`);
    let componentCount = this._componentCount * this._arraySize, len4 = Math.min(out.length, componentCount * this.length), dest = this._tempBufferGetter(len4), elementSize = this._bufferType.BYTES_PER_ELEMENT, destSize = elementSize * len4, srcFormatSize = this._formatSize * this._arraySize, destFormatSize = this._componentCount * elementSize * this._arraySize;
    this.engine.wasm._wl_mesh_get_attribute_values(this._attribute, srcFormatSize, this._offset + index * this._stride, this._stride, destFormatSize, dest.byteOffset, destSize);
    for (let i = 0; i < len4; ++i)
      out[i] = dest[i];
    return out;
  }
  set(i, v) {
    if (v.length % this._componentCount !== 0)
      throw new Error(`out.length, ${v.length} is not a multiple of the attribute vector components, ${this._componentCount}`);
    let componentCount = this._componentCount * this._arraySize, len4 = Math.min(v.length, componentCount * this.length), elementSize = this._bufferType.BYTES_PER_ELEMENT, srcSize = elementSize * len4, srcFormatSize = componentCount * elementSize, destFormatSize = this._formatSize * this._arraySize, wasm = this.engine.wasm;
    if (v.buffer != wasm.HEAPU8.buffer) {
      let dest = this._tempBufferGetter(len4);
      dest.set(v), v = dest;
    }
    return wasm._wl_mesh_set_attribute_values(this._attribute, srcFormatSize, v.byteOffset, srcSize, destFormatSize, this._offset + i * this._stride, this._stride), this;
  }
  get engine() {
    return this._engine;
  }
};
var Font = class extends Resource {
  static getResourceType() {
    return 5;
  }
  get emHeight() {
    return this.engine.wasm._wl_font_get_emHeight(this._id);
  }
  get capHeight() {
    return this.engine.wasm._wl_font_get_capHeight(this._id);
  }
  get xHeight() {
    return this.engine.wasm._wl_font_get_xHeight(this._id);
  }
  get outlineSize() {
    return this.engine.wasm._wl_font_get_outlineSize(this._id);
  }
};
var ParticleEffect = class extends Resource {
  static getResourceType() {
    return 6;
  }
  get maxCount() {
    return this.engine.wasm._wl_particleEffect_get_maxCount(this._id);
  }
  destroy() {
    this.engine.wasm._wl_particleEffect_destroy(this._id), this.engine.particleEffects._destroy(this);
  }
  toString() {
    return this.isDestroyed ? "ParticleEffect(destroyed)" : `ParticleEffect(${this._index})`;
  }
};
var Pipeline = class extends Resource {
  static getResourceType() {
    return 9;
  }
  onPreRender = new Emitter();
  onPostRender = new Emitter();
  get name() {
    return this.engine.wasm.UTF8ToString(this.engine.wasm._wl_pipeline_get_name(this._index));
  }
  get webglProgram() {
    let wasm = this.engine.wasm;
    return wasm.GL.programs[wasm._wl_pipeline_get_api_object(this._index)] ?? null;
  }
  set renderHooks(v) {
    this.engine.wasm._wl_pipeline_set_enableRendererHooks(this._index, v);
  }
  get renderHooks() {
    return this.engine.wasm._wl_pipeline_get_enableRendererHooks(this._index);
  }
};
var ProbeVolumeScenario = class extends Resource {
  static getResourceType() {
    return 7;
  }
  get loaded() {
    return !!this.engine.wasm._wl_probeVolumeScenario_loaded(this._index);
  }
};
var temp2d = null;
var Texture = class extends Resource {
  static getResourceType() {
    return 3;
  }
  constructor(engine2, param) {
    if (isImageLike(param)) {
      let texture = engine2.textures.create(param);
      return super(engine2, texture._index), texture;
    }
    super(engine2, param);
  }
  get valid() {
    return !this.isDestroyed && this.width !== 0 && this.height !== 0;
  }
  get id() {
    return this.index;
  }
  update() {
    let image = this._imageIndex;
    !this.valid || !image || this.engine.wasm._wl_image_markDirty(image);
  }
  get width() {
    let wasm = this.engine.wasm;
    return wasm._wl_image_size(this._imageIndex, wasm._tempMem), wasm._tempMemUint32[0];
  }
  get height() {
    let wasm = this.engine.wasm;
    return wasm._wl_image_size(this._imageIndex, wasm._tempMem), wasm._tempMemUint32[1];
  }
  get htmlElement() {
    let image = this._imageIndex;
    if (!image)
      return null;
    let wasm = this.engine.wasm, jsImageIndex = wasm._wl_image_get_jsImage_index(image);
    return wasm._images[jsImageIndex];
  }
  updateSubImage(srcX, srcY, srcWidth, srcHeight, dstX = srcX, dstY = srcY, content) {
    if (this.isDestroyed)
      return false;
    let image = this._imageIndex;
    if (!image)
      return false;
    let wasm = this.engine.wasm;
    wasm._wl_image_borderPadding(image) && this.engine.log.warn(0, "Image created with border padding should be updated using Texture.update(), or visual results might be unexpected. Create a texture without border padding using engine.textures.create(image, {border: false})");
    let img = content ?? this.htmlElement;
    if (!img)
      return false;
    let isImageBitmap = img instanceof ImageBitmap, flipY = !isImageBitmap;
    if (srcX || srcY) {
      if (img instanceof ImageData)
        throw new Error("Texture.updateSubImage(): ImageData does not support non-zero srcX/srcY offsets.");
      if (!temp2d) {
        let canvas2 = document.createElement("canvas"), ctx = canvas2.getContext("2d");
        if (!ctx)
          throw new Error("Texture.updateSubImage(): Failed to obtain CanvasRenderingContext2D.");
        temp2d = { canvas: canvas2, ctx };
      }
      temp2d.canvas.width = srcWidth, temp2d.canvas.height = srcHeight, temp2d.ctx.drawImage(img, srcX, isImageBitmap ? img.height - srcY - srcHeight : srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight), img = temp2d.canvas;
    }
    wasm._images[0] = img;
    let width = srcWidth - Math.max(srcWidth + dstX - this.width, 0), height = srcHeight - Math.max(srcHeight + dstY - this.height, 0), dstReversedY = this.height - dstY - height, ret = wasm._wl_renderer_updateImage(image, 0, width, height, dstX, dstReversedY, flipY);
    return wasm._images[0] = null, !!ret;
  }
  destroy() {
    let wasm = this.engine.wasm, imageIndex = this._imageIndex, jsImageIndex = wasm._wl_image_get_jsImage_index(imageIndex);
    if (jsImageIndex) {
      let img = wasm._images[jsImageIndex];
      img instanceof ImageBitmap && img.close(), wasm._images[jsImageIndex] = null;
    }
    wasm._wl_image_destroy(imageIndex), wasm._wl_texture_destroy(this._id), this.engine.textures._destroy(this);
  }
  toString() {
    return this.isDestroyed ? "Texture(destroyed)" : `Texture(${this._index})`;
  }
  get _imageIndex() {
    return this.engine.wasm._wl_texture_get_image_index(this._id);
  }
};
var Animation2 = class extends SceneResource {
  constructor(host = WL, index) {
    let scene = host instanceof Prefab ? host : host.scene;
    super(scene, index);
  }
  get duration() {
    return this.engine.wasm._wl_animation_get_duration(this._id);
  }
  get trackCount() {
    return this.engine.wasm._wl_animation_get_trackCount(this._id);
  }
  retarget(newTargets) {
    let wasm = this.engine.wasm;
    if (newTargets instanceof Skin) {
      let index2 = wasm._wl_animation_retargetToSkin(this._id, newTargets._id);
      return this._scene.animations.wrap(index2);
    }
    if (newTargets.length != this.trackCount)
      throw Error("Expected " + this.trackCount.toString() + " targets, but got " + newTargets.length.toString());
    let ptr = wasm._malloc(2 * newTargets.length);
    for (let i = 0; i < newTargets.length; ++i) {
      let object3d = newTargets[i];
      this.scene.assertOrigin(object3d), wasm.HEAPU16[(ptr >>> 1) + i] = newTargets[i].objectId;
    }
    let index = wasm._wl_animation_retarget(this._id, ptr);
    return wasm._free(ptr), this._scene.animations.wrap(index);
  }
  toString() {
    return this.isDestroyed ? "Animation(destroyed)" : `Animation(${this._index})`;
  }
};
var AnimationGraph = class extends SceneResource {
  setPlaybackSpeed(samplerIndex, speed) {
    this.engine.wasm._wl_animationGraph_sampler_set_playbackSpeed(this._id, samplerIndex, speed);
  }
  toString() {
    return this.isDestroyed ? "AnimationGraph(destroyed)" : `AnimationGraph(${this._index})`;
  }
};
var Object3D2 = class {
  _id = -1;
  _localId = -1;
  _scene;
  _engine;
  constructor(scene, id) {
    scene = scene instanceof Prefab ? scene : scene.scene, this._localId = id, this._id = scene._index << 22 | id, this._scene = scene, this._engine = scene.engine;
  }
  get name() {
    let wasm = this._engine.wasm;
    return wasm.UTF8ToString(wasm._wl_object_name(this._id));
  }
  set name(newName) {
    let wasm = this._engine.wasm;
    wasm._wl_object_set_name(this._id, wasm.tempUTF8(newName));
  }
  get parent() {
    let p = this._engine.wasm._wl_object_parent(this._id);
    return p === 0 ? null : this._scene.wrap(p);
  }
  get children() {
    return this.getChildren();
  }
  get childrenCount() {
    return this._engine.wasm._wl_object_get_children_count(this._id);
  }
  set parent(newParent) {
    if (this.markedDestroyed) {
      let strThis = this.toString(), strParent = newParent || "root";
      throw new Error(`Failed to attach ${strThis} to ${strParent}. ${strThis} is marked as destroyed.`);
    } else if (newParent?.markedDestroyed) {
      let strParent = newParent.toString();
      throw new Error(`Failed to attach ${this} to ${strParent}. ${strParent} is marked as destroyed.`);
    }
    this.scene.assertOrigin(newParent), this._engine.wasm._wl_object_set_parent(this._id, newParent == null ? 0 : newParent._id);
  }
  get objectId() {
    return this._localId;
  }
  get scene() {
    return this._scene;
  }
  get engine() {
    return this._engine;
  }
  addChild() {
    let objectId = this.engine.wasm._wl_scene_add_object(this.scene._index, this._id);
    return this.scene.wrap(objectId);
  }
  clone(parent = null) {
    this.scene.assertOrigin(parent);
    let id = this._engine.wasm._wl_object_clone(this._id, parent ? parent._id : 0);
    return this._scene.wrap(id);
  }
  getChildren(out = new Array(this.childrenCount)) {
    let childrenCount = this.childrenCount;
    if (childrenCount === 0)
      return out;
    let wasm = this._engine.wasm;
    wasm.requireTempMem(childrenCount * 2), this._engine.wasm._wl_object_get_children(this._id, wasm._tempMem, wasm._tempMemSize >> 1);
    for (let i = 0; i < childrenCount; ++i)
      out[i] = this._scene.wrap(wasm._tempMemUint16[i]);
    return out;
  }
  resetTransform() {
    return this._engine.wasm._wl_object_reset_translation_rotation(this._id), this._engine.wasm._wl_object_reset_scaling(this._id), this;
  }
  resetPositionRotation() {
    return this._engine.wasm._wl_object_reset_translation_rotation(this._id), this;
  }
  resetTranslationRotation() {
    return this.resetPositionRotation();
  }
  resetRotation() {
    return this._engine.wasm._wl_object_reset_rotation(this._id), this;
  }
  resetPosition() {
    return this._engine.wasm._wl_object_reset_translation(this._id), this;
  }
  resetTranslation() {
    return this.resetPosition();
  }
  resetScaling() {
    return this._engine.wasm._wl_object_reset_scaling(this._id), this;
  }
  translate(v) {
    return this.translateLocal(v);
  }
  translateLocal(v) {
    return this._engine.wasm._wl_object_translate(this._id, v[0], v[1], v[2]), this;
  }
  translateObject(v) {
    return this._engine.wasm._wl_object_translate_obj(this._id, v[0], v[1], v[2]), this;
  }
  translateWorld(v) {
    return this._engine.wasm._wl_object_translate_world(this._id, v[0], v[1], v[2]), this;
  }
  rotateAxisAngleDeg(a, d) {
    return this.rotateAxisAngleDegLocal(a, d), this;
  }
  rotateAxisAngleDegLocal(a, d) {
    return this._engine.wasm._wl_object_rotate_axis_angle(this._id, a[0], a[1], a[2], d), this;
  }
  rotateAxisAngleRad(a, d) {
    return this.rotateAxisAngleRadLocal(a, d);
  }
  rotateAxisAngleRadLocal(a, d) {
    return this._engine.wasm._wl_object_rotate_axis_angle_rad(this._id, a[0], a[1], a[2], d), this;
  }
  rotateAxisAngleDegObject(a, d) {
    return this._engine.wasm._wl_object_rotate_axis_angle_obj(this._id, a[0], a[1], a[2], d), this;
  }
  rotateAxisAngleRadObject(a, d) {
    return this._engine.wasm._wl_object_rotate_axis_angle_rad_obj(this._id, a[0], a[1], a[2], d), this;
  }
  rotate(q) {
    return this.rotateLocal(q), this;
  }
  rotateLocal(q) {
    return this._engine.wasm._wl_object_rotate_quat(this._id, q[0], q[1], q[2], q[3]), this;
  }
  rotateObject(q) {
    return this._engine.wasm._wl_object_rotate_quat_obj(this._id, q[0], q[1], q[2], q[3]), this;
  }
  scale(v) {
    return this.scaleLocal(v), this;
  }
  scaleLocal(v) {
    return this._engine.wasm._wl_object_scale(this._id, v[0], v[1], v[2]), this;
  }
  getPositionLocal(out = new Float32Array(3)) {
    let wasm = this._engine.wasm;
    return wasm._wl_object_get_translation_local(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  getTranslationLocal(out = new Float32Array(3)) {
    return this.getPositionLocal(out);
  }
  getPositionWorld(out = new Float32Array(3)) {
    let wasm = this._engine.wasm;
    return wasm._wl_object_get_translation_world(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  getTranslationWorld(out = new Float32Array(3)) {
    return this.getPositionWorld(out);
  }
  setPositionLocal(v) {
    return this._engine.wasm._wl_object_set_translation_local(this._id, v[0], v[1], v[2]), this;
  }
  setTranslationLocal(v) {
    return this.setPositionLocal(v);
  }
  setPositionWorld(v) {
    return this._engine.wasm._wl_object_set_translation_world(this._id, v[0], v[1], v[2]), this;
  }
  setTranslationWorld(v) {
    return this.setPositionWorld(v);
  }
  getScalingLocal(out = new Float32Array(3)) {
    let wasm = this._engine.wasm, ptr = wasm._wl_object_scaling_local(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out;
  }
  setScalingLocal(v) {
    return this._engine.wasm._wl_object_set_scaling_local(this._id, v[0], v[1], v[2]), this;
  }
  getScalingWorld(out = new Float32Array(3)) {
    let wasm = this._engine.wasm, ptr = wasm._wl_object_scaling_world(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out;
  }
  setScalingWorld(v) {
    return this._engine.wasm._wl_object_set_scaling_world(this._id, v[0], v[1], v[2]), this;
  }
  getRotationLocal(out = new Float32Array(4)) {
    let wasm = this._engine.wasm, ptr = wasm._wl_object_trans_local(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out[3] = wasm.HEAPF32[ptr + 3], out;
  }
  setRotationLocal(v) {
    return this._engine.wasm._wl_object_set_rotation_local(this._id, v[0], v[1], v[2], v[3]), this;
  }
  getRotationWorld(out = new Float32Array(4)) {
    let wasm = this._engine.wasm, ptr = wasm._wl_object_trans_world(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out[3] = wasm.HEAPF32[ptr + 3], out;
  }
  setRotationWorld(v) {
    return this._engine.wasm._wl_object_set_rotation_world(this._id, v[0], v[1], v[2], v[3]), this;
  }
  getTransformLocal(out = new Float32Array(8)) {
    let wasm = this._engine.wasm, ptr = wasm._wl_object_trans_local(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out[3] = wasm.HEAPF32[ptr + 3], out[4] = wasm.HEAPF32[ptr + 4], out[5] = wasm.HEAPF32[ptr + 5], out[6] = wasm.HEAPF32[ptr + 6], out[7] = wasm.HEAPF32[ptr + 7], out;
  }
  setTransformLocal(v) {
    let wasm = this._engine.wasm, ptr = wasm._wl_object_trans_local(this._id) / 4;
    return wasm.HEAPF32[ptr] = v[0], wasm.HEAPF32[ptr + 1] = v[1], wasm.HEAPF32[ptr + 2] = v[2], wasm.HEAPF32[ptr + 3] = v[3], wasm.HEAPF32[ptr + 4] = v[4], wasm.HEAPF32[ptr + 5] = v[5], wasm.HEAPF32[ptr + 6] = v[6], wasm.HEAPF32[ptr + 7] = v[7], this.setDirty(), this;
  }
  getTransformWorld(out = new Float32Array(8)) {
    let wasm = this._engine.wasm, ptr = wasm._wl_object_trans_world(this._id) / 4;
    return out[0] = wasm.HEAPF32[ptr], out[1] = wasm.HEAPF32[ptr + 1], out[2] = wasm.HEAPF32[ptr + 2], out[3] = wasm.HEAPF32[ptr + 3], out[4] = wasm.HEAPF32[ptr + 4], out[5] = wasm.HEAPF32[ptr + 5], out[6] = wasm.HEAPF32[ptr + 6], out[7] = wasm.HEAPF32[ptr + 7], out;
  }
  setTransformWorld(v) {
    let wasm = this._engine.wasm, ptr = wasm._wl_object_trans_world(this._id) / 4;
    return wasm.HEAPF32[ptr] = v[0], wasm.HEAPF32[ptr + 1] = v[1], wasm.HEAPF32[ptr + 2] = v[2], wasm.HEAPF32[ptr + 3] = v[3], wasm.HEAPF32[ptr + 4] = v[4], wasm.HEAPF32[ptr + 5] = v[5], wasm.HEAPF32[ptr + 6] = v[6], wasm.HEAPF32[ptr + 7] = v[7], this._engine.wasm._wl_object_trans_world_to_local(this._id), this;
  }
  get transformLocal() {
    let wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_object_trans_local(this._id), 8);
  }
  set transformLocal(t) {
    this.transformLocal.set(t), this.setDirty();
  }
  get transformWorld() {
    let wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_object_trans_world(this._id), 8);
  }
  set transformWorld(t) {
    this.transformWorld.set(t), this._engine.wasm._wl_object_trans_world_to_local(this._id);
  }
  get scalingLocal() {
    let wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_object_scaling_local(this._id), 3);
  }
  set scalingLocal(s) {
    this.scalingLocal.set(s), this.setDirty();
  }
  get scalingWorld() {
    let wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_object_scaling_world(this._id), 3);
  }
  set scalingWorld(s) {
    this.scalingWorld.set(s), this._engine.wasm._wl_object_scaling_world_to_local(this._id);
  }
  get rotationLocal() {
    return this.transformLocal.subarray(0, 4);
  }
  get rotationWorld() {
    return this.transformWorld.subarray(0, 4);
  }
  set rotationLocal(r) {
    this._engine.wasm._wl_object_set_rotation_local(this._id, r[0], r[1], r[2], r[3]);
  }
  set rotationWorld(r) {
    this._engine.wasm._wl_object_set_rotation_world(this._id, r[0], r[1], r[2], r[3]);
  }
  getForward(out) {
    return this.getForwardWorld(out);
  }
  getForwardWorld(out) {
    return out[0] = 0, out[1] = 0, out[2] = -1, this.transformVectorWorld(out), out;
  }
  getUp(out) {
    return this.getUpWorld(out);
  }
  getUpWorld(out) {
    return out[0] = 0, out[1] = 1, out[2] = 0, this.transformVectorWorld(out), out;
  }
  getRight(out) {
    return this.getRightWorld(out);
  }
  getRightWorld(out) {
    return out[0] = 1, out[1] = 0, out[2] = 0, this.transformVectorWorld(out), out;
  }
  transformVectorWorld(out, v = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat[0] = v[0], wasm._tempMemFloat[1] = v[1], wasm._tempMemFloat[2] = v[2], wasm._wl_object_transformVectorWorld(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  transformVectorLocal(out, v = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat[0] = v[0], wasm._tempMemFloat[1] = v[1], wasm._tempMemFloat[2] = v[2], wasm._wl_object_transformVectorLocal(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  transformPointWorld(out, p = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat[0] = p[0], wasm._tempMemFloat[1] = p[1], wasm._tempMemFloat[2] = p[2], wasm._wl_object_transformPointWorld(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  transformPointLocal(out, p = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat[0] = p[0], wasm._tempMemFloat[1] = p[1], wasm._tempMemFloat[2] = p[2], wasm._wl_object_transformPointLocal(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  transformVectorInverseWorld(out, v = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat[0] = v[0], wasm._tempMemFloat[1] = v[1], wasm._tempMemFloat[2] = v[2], wasm._wl_object_transformVectorInverseWorld(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  transformVectorInverseLocal(out, v = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat[0] = v[0], wasm._tempMemFloat[1] = v[1], wasm._tempMemFloat[2] = v[2], wasm._wl_object_transformVectorInverseLocal(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  transformPointInverseWorld(out, p = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat[0] = p[0], wasm._tempMemFloat[1] = p[1], wasm._tempMemFloat[2] = p[2], wasm._wl_object_transformPointInverseWorld(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  transformPointInverseLocal(out, p = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat.set(p), wasm._wl_object_transformPointInverseLocal(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  toWorldSpaceTransform(out, q = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat.set(q), wasm._wl_object_toWorldSpaceTransform(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out[3] = wasm._tempMemFloat[3], out[4] = wasm._tempMemFloat[4], out[5] = wasm._tempMemFloat[5], out[6] = wasm._tempMemFloat[6], out[7] = wasm._tempMemFloat[7], out;
  }
  toLocalSpaceTransform(out, q = out) {
    let p = this.parent;
    return p ? (p.toObjectSpaceTransform(out, q), out) : (out !== q && (out[0] = q[0], out[1] = q[1], out[2] = q[2], out[3] = q[3], out[4] = q[4], out[5] = q[5], out[6] = q[6], out[7] = q[7]), out);
  }
  toObjectSpaceTransform(out, q = out) {
    let wasm = this._engine.wasm;
    return wasm._tempMemFloat.set(q), wasm._wl_object_toObjectSpaceTransform(this._id, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out[3] = wasm._tempMemFloat[3], out[4] = wasm._tempMemFloat[4], out[5] = wasm._tempMemFloat[5], out[6] = wasm._tempMemFloat[6], out[7] = wasm._tempMemFloat[7], out;
  }
  lookAt(p, up = UP_VECTOR) {
    return this._engine.wasm._wl_object_lookAt(this._id, p[0], p[1], p[2], up[0], up[1], up[2]), this;
  }
  destroy() {
    this._id < 0 || this.engine.wasm._wl_object_remove(this._id);
  }
  setDirty() {
    this._engine.wasm._wl_object_set_dirty(this._id);
  }
  set active(b) {
    let comps = this.getComponents();
    for (let c of comps)
      c.active = b;
  }
  getComponent(typeOrClass, index = 0) {
    let wasm = this._engine.wasm, type = isString(typeOrClass) ? typeOrClass : typeOrClass.TypeName, scene = this._scene, componentType = wasm._wl_scene_get_component_manager_index(scene._index, wasm.tempUTF8(type));
    if (componentType < 0) {
      let typeIndex = wasm._componentTypeIndices[type];
      if (typeIndex === void 0)
        return null;
      let jsIndex = wasm._wl_get_js_component_index(this._id, typeIndex, index);
      if (jsIndex < 0)
        return null;
      let component = this._scene._jsComponents[jsIndex];
      return component.constructor !== BrokenComponent ? component : null;
    }
    let componentId = wasm._wl_get_component_id(this._id, componentType, index);
    return scene._components.wrapNative(componentType, componentId);
  }
  getComponents(typeOrClass) {
    let wasm = this._engine.wasm, scene = this._scene, manager = null, type = null;
    if (typeOrClass) {
      type = isString(typeOrClass) ? typeOrClass : typeOrClass.TypeName;
      let nativeManager = scene._components.getNativeManager(type);
      manager = nativeManager !== null ? nativeManager : scene._components.js;
    }
    let components = [], maxComps = Math.floor(wasm._tempMemSize / 3 * 2), componentsCount = wasm._wl_object_get_components(this._id, wasm._tempMem, maxComps), offset2 = 2 * componentsCount;
    wasm._wl_object_get_component_types(this._id, wasm._tempMem + offset2, maxComps);
    for (let i = 0; i < componentsCount; ++i) {
      let t = wasm._tempMemUint8[i + offset2], componentId = wasm._tempMemUint16[i];
      if (manager !== null && t !== manager)
        continue;
      let comp = this._scene._components.wrapAny(t, componentId);
      comp && (type && type !== comp.constructor.TypeName || components.push(comp));
    }
    return components;
  }
  addComponent(typeOrClass, params) {
    if (this.markedDestroyed)
      throw new Error(`Failed to add component. ${this} is marked as destroyed.`);
    let wasm = this._engine.wasm, type = isString(typeOrClass) ? typeOrClass : typeOrClass.TypeName, nativeManager = this._scene._components.getNativeManager(type), isNative = nativeManager !== null, manager = isNative ? nativeManager : this._scene._components.js, componentId = -1;
    if (isNative)
      componentId = wasm._wl_object_add_component(this._id, manager);
    else {
      if (!(type in wasm._componentTypeIndices))
        throw new TypeError("Unknown component type '" + type + "'");
      componentId = wasm._wl_object_add_js_component(this._id, wasm._componentTypeIndices[type]);
    }
    let component = this._scene._components.wrapAny(manager, componentId);
    return params !== void 0 && component.copy(params), isNative || component._triggerInit(), (!params || !("active" in params && !params.active)) && (component.active = true), component;
  }
  findByName(name, recursive = false) {
    return recursive ? this.findByNameRecursive(name) : this.findByNameDirect(name);
  }
  findByNameDirect(name) {
    let wasm = this._engine.wasm, id = this._id, maxCount = (wasm._tempMemSize >> 2) - 2, buffer = wasm._tempMemUint16;
    buffer[maxCount] = 0, buffer[maxCount + 1] = 0;
    let bufferPtr = wasm._tempMem, indexPtr = bufferPtr + maxCount * 2, childCountPtr = bufferPtr + maxCount * 2 + 2, namePtr = wasm.tempUTF8(name, (maxCount + 2) * 2), result = [], read = 0;
    for (; read = wasm._wl_object_findByName(id, namePtr, indexPtr, childCountPtr, bufferPtr, maxCount); )
      for (let i = 0; i < read; ++i)
        result.push(this._scene.wrap(buffer[i]));
    return result;
  }
  findByNameRecursive(name) {
    let wasm = this._engine.wasm, id = this._id, maxCount = (wasm._tempMemSize >> 2) - 1, buffer = wasm._tempMemUint16;
    buffer[maxCount] = 0;
    let bufferPtr = wasm._tempMem, indexPtr = bufferPtr + maxCount * 2, namePtr = wasm.tempUTF8(name, (maxCount + 1) * 2), read = 0, result = [];
    for (; read = wasm._wl_object_findByNameRecursive(id, namePtr, indexPtr, bufferPtr, maxCount); )
      for (let i = 0; i < read; ++i)
        result.push(this._scene.wrap(buffer[i]));
    return result;
  }
  get changed() {
    return !!this._engine.wasm._wl_object_is_changed(this._id);
  }
  get isDestroyed() {
    return this._id < 0;
  }
  get markedDestroyed() {
    return !!this.engine.wasm._wl_object_markedDestroyed(this._id);
  }
  equals(otherObject) {
    return otherObject ? this._id == otherObject._id : false;
  }
  toString() {
    return this.isDestroyed ? "Object3D(destroyed)" : `Object3D('${this.name}', ${this._localId})`;
  }
};
var Skin = class extends SceneResource {
  get jointCount() {
    return this.engine.wasm._wl_skin_get_joint_count(this._id);
  }
  get jointIds() {
    let wasm = this.engine.wasm;
    return new Uint16Array(wasm.HEAPU16.buffer, wasm._wl_skin_joint_ids(this._id), this.jointCount);
  }
  get inverseBindTransforms() {
    let wasm = this.engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_skin_inverse_bind_transforms(this._id), 8 * this.jointCount);
  }
  get inverseBindScalings() {
    let wasm = this.engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_skin_inverse_bind_scalings(this._id), 3 * this.jointCount);
  }
};
var MorphTargets = class extends Resource {
  static getResourceType() {
    return 4;
  }
  get count() {
    return this.engine.wasm._wl_morph_targets_get_target_count(this._id);
  }
  getTargetName(target) {
    if (target >= this.count)
      throw new Error(`Index ${target} is out of bounds for ${this.count} targets`);
    let wasm = this.engine.wasm;
    return wasm.UTF8ToString(wasm._wl_morph_targets_get_target_name(this._id, target));
  }
  getTargetIndex(name) {
    let wasm = this.engine.wasm, index = wasm._wl_morph_targets_get_target_index(this._id, wasm.tempUTF8(name));
    if (index === -1)
      throw Error(`Missing target '${name}'`);
    return index;
  }
};
var RayHit = class {
  _scene;
  _ptr;
  constructor(scene, ptr) {
    if (ptr & 3)
      throw new Error("Misaligned pointer: please report a bug");
    this._scene = scene, this._ptr = ptr;
  }
  getLocations(out) {
    out = out ?? Array.from({ length: this.hitCount }, () => new Float32Array(3));
    let wasm = this.engine.wasm, alignedPtr = this._ptr / 4;
    for (let i = 0; i < this.hitCount; ++i) {
      let locationPtr = alignedPtr + 3 * i;
      out[i][0] = wasm.HEAPF32[locationPtr], out[i][1] = wasm.HEAPF32[locationPtr + 1], out[i][2] = wasm.HEAPF32[locationPtr + 2];
    }
    return out;
  }
  getNormals(out) {
    out = out ?? Array.from({ length: this.hitCount }, () => new Float32Array(3));
    let wasm = this.engine.wasm, alignedPtr = (this._ptr + 48) / 4;
    for (let i = 0; i < this.hitCount; ++i) {
      let normalPtr = alignedPtr + 3 * i;
      out[i][0] = wasm.HEAPF32[normalPtr], out[i][1] = wasm.HEAPF32[normalPtr + 1], out[i][2] = wasm.HEAPF32[normalPtr + 2];
    }
    return out;
  }
  getDistances(out = new Float32Array(this.hitCount)) {
    let wasm = this.engine.wasm, alignedPtr = (this._ptr + 48 * 2) / 4;
    for (let i = 0; i < this.hitCount; ++i) {
      let distancePtr = alignedPtr + i;
      out[i] = wasm.HEAPF32[distancePtr];
    }
    return out;
  }
  getObjects(out = new Array(this.hitCount)) {
    let HEAPU16 = this.engine.wasm.HEAPU16, alignedPtr = this._ptr + (48 * 2 + 16) >> 1;
    for (let i = 0; i < this.hitCount; ++i)
      out[i] = this._scene.wrap(HEAPU16[alignedPtr + i]);
    return out;
  }
  get engine() {
    return this._scene.engine;
  }
  get locations() {
    return this.getLocations();
  }
  get normals() {
    return this.getNormals();
  }
  get distances() {
    return this.getDistances();
  }
  get objects() {
    let objects = [null, null, null, null];
    return this.getObjects(objects);
  }
  get hitCount() {
    return Math.min(this.engine.wasm.HEAPU32[this._ptr / 4 + 30], 4);
  }
};
var math = class {
  static cubicHermite(out, a, b, c, d, f, engine2 = WL) {
    let wasm = engine2.wasm;
    wasm._tempMemFloat.subarray(0).set(a), wasm._tempMemFloat.subarray(4).set(b), wasm._tempMemFloat.subarray(8).set(c), wasm._tempMemFloat.subarray(12).set(d);
    let isQuat = a.length == 4;
    return wasm._wl_math_cubicHermite(wasm._tempMem + 4 * 16, wasm._tempMem + 4 * 0, wasm._tempMem + 4 * 4, wasm._tempMem + 4 * 8, wasm._tempMem + 4 * 12, f, isQuat), out[0] = wasm._tempMemFloat[16], out[1] = wasm._tempMemFloat[17], out[2] = wasm._tempMemFloat[18], isQuat && (out[3] = wasm._tempMemFloat[19]), out;
  }
};
var I18N = class {
  onLanguageChanged = new Emitter();
  _engine;
  _prevLanguageIndex = -1;
  constructor(engine2) {
    this._engine = engine2;
  }
  set language(code) {
    this.setLanguage(code);
  }
  get language() {
    let wasm = this._engine.wasm, code = wasm._wl_i18n_currentLanguage();
    return code === 0 ? null : wasm.UTF8ToString(code);
  }
  get currentIndex() {
    return this._engine.wasm._wl_i18n_currentLanguageIndex();
  }
  get previousIndex() {
    return this._prevLanguageIndex;
  }
  async setLanguage(code) {
    if (code == null)
      return Promise.resolve(this.currentIndex);
    let wasm = this._engine.wasm;
    this._prevLanguageIndex = this.currentIndex, wasm._wl_i18n_setLanguage(wasm.tempUTF8(code));
    let scene = this.engine.scene, filename = wasm.UTF8ToString(wasm._wl_i18n_languageFile(this.currentIndex)), url = `${scene.baseURL}/locale/${filename}`;
    return await this.engine._loadResourcesBin(url), this.onLanguageChanged.notify(this._prevLanguageIndex, this.currentIndex), this.currentIndex;
  }
  translate(term) {
    let wasm = this._engine.wasm, translation = wasm._wl_i18n_translate(wasm.tempUTF8(term));
    return translation === 0 ? null : wasm.UTF8ToString(translation);
  }
  languageCount() {
    return this._engine.wasm._wl_i18n_languageCount();
  }
  languageIndex(code) {
    let wasm = this._engine.wasm;
    return wasm._wl_i18n_languageIndex(wasm.tempUTF8(code));
  }
  languageCode(index) {
    let wasm = this._engine.wasm, code = wasm._wl_i18n_languageCode(index);
    return code === 0 ? null : wasm.UTF8ToString(code);
  }
  languageName(index) {
    let wasm = this._engine.wasm, name = wasm._wl_i18n_languageName(index);
    return name === 0 ? null : wasm.UTF8ToString(name);
  }
  get engine() {
    return this._engine;
  }
};
var Environment = class {
  _scene;
  constructor(scene) {
    this._scene = scene;
  }
  requestBake() {
    let scene = this._scene;
    scene.engine.wasm._wl_scene_environment_bake(scene._index);
  }
  get intensity() {
    return this._scene.engine.wasm._wl_scene_environment_get_intensity(this._scene._index);
  }
  set intensity(intensity) {
    this._scene.engine.wasm._wl_scene_environment_set_intensity(this._scene._index, intensity);
  }
  getTint(out = new Float32Array(3)) {
    let wasm = this._scene.engine.wasm;
    return wasm._wl_scene_environment_get_tint(this._scene._index, wasm._tempMem), out[0] = wasm._tempMemFloat[0], out[1] = wasm._tempMemFloat[1], out[2] = wasm._tempMemFloat[2], out;
  }
  get tint() {
    return this.getTint();
  }
  setTint(v) {
    this._scene.engine.wasm._wl_scene_environment_set_tint(this._scene._index, v[0], v[1], v[2]);
  }
  set tint(v) {
    this.setTint(v);
  }
  getCoefficients(out = new Float32Array(3 * 9)) {
    let wasm = this._scene.engine.wasm;
    wasm.requireTempMem(3 * 9 * 4), wasm._wl_scene_environment_get_coefficients(this._scene._index, wasm._tempMem);
    for (let i = 0; i < 3 * 9; ++i)
      out[i] = wasm._tempMemFloat[i];
    return out;
  }
  get coefficients() {
    return this.getCoefficients();
  }
  setCoefficients(v) {
    let count = v.length / 3;
    count > 9 ? count = 9 : count > 4 && count < 9 ? count = 4 : count > 1 && count < 4 && (count = 1);
    let wasm = this._scene.engine.wasm;
    wasm._tempMemFloat.set(v), wasm._wl_scene_environment_set_coefficients(this._scene._index, wasm._tempMem, count);
  }
  set coefficients(v) {
    this.setCoefficients(v);
  }
};
var SSAO = class {
  _scene;
  constructor(scene) {
    this._scene = scene;
  }
  get enabled() {
    return !!this._scene.engine.wasm._wl_scene_ssao_get_enabled(this._scene._index);
  }
  set enabled(value) {
    this._scene.engine.wasm._wl_scene_ssao_set_enabled(this._scene._index, value);
  }
  get radius() {
    return this._scene.engine.wasm._wl_scene_ssao_get_radius(this._scene._index);
  }
  set radius(value) {
    this._scene.engine.wasm._wl_scene_ssao_set_radius(this._scene._index, value);
  }
  get intensity() {
    return this._scene.engine.wasm._wl_scene_ssao_get_intensity(this._scene._index);
  }
  set intensity(value) {
    this._scene.engine.wasm._wl_scene_ssao_set_intensity(this._scene._index, value);
  }
};
var AudioClip = class extends Resource {
  static getResourceType() {
    return 8;
  }
  get source() {
    let wasm = this.engine.wasm, ptr = wasm._wl_audioClip_source(this._id);
    return wasm.UTF8ToString(ptr);
  }
};
var version = "1.6.0";
var matches = version.match(/([0-9]+).([0-9]+).([0-9]+)(?:-rc.([0-9]+))?/);
(!matches || matches.length < 4) && console.error(`Invalid version '${version}'. Expected: major.minor.patch[-rc.x]`);
var APIVersion = { major: Number.parseInt(matches[1]), minor: Number.parseInt(matches[2]), patch: Number.parseInt(matches[3]), rc: matches[4] !== void 0 ? Number.parseInt(matches[4]) : 0 };
function timeout(time) {
  return new Promise((res) => setTimeout(res, time));
}
function clamp(val, min2, max2) {
  return Math.max(Math.min(max2, val), min2);
}
function capitalizeFirstUTF8(str5) {
  return `${str5[0].toUpperCase()}${str5.substring(1)}`;
}
var MaterialParamType = ((MaterialParamType2) => (MaterialParamType2[MaterialParamType2.UnsignedInt = 0] = "UnsignedInt", MaterialParamType2[MaterialParamType2.Int = 1] = "Int", MaterialParamType2[MaterialParamType2.HalfFloat = 2] = "HalfFloat", MaterialParamType2[MaterialParamType2.Float = 3] = "Float", MaterialParamType2[MaterialParamType2.Sampler = 4] = "Sampler", MaterialParamType2[MaterialParamType2.Font = 5] = "Font", MaterialParamType2))(MaterialParamType || {});
var Material = class extends Resource {
  static getResourceType() {
    return 1;
  }
  constructor(engine2, params) {
    if (typeof params != "number") {
      if (!params?.pipeline)
        throw new Error("Missing parameter 'pipeline'");
      let template = engine2.materials.getTemplate(params.pipeline), material = new template();
      return super(engine2, material._index), material;
    }
    super(engine2, params);
  }
  hasParameter(name) {
    let parameters = this.constructor.Parameters;
    return parameters && parameters.has(name);
  }
  get shader() {
    return this.pipeline;
  }
  get pipeline() {
    let wasm = this.engine.wasm;
    return wasm.UTF8ToString(wasm._wl_material_get_pipeline(this._id));
  }
  clone() {
    let index = this.engine.wasm._wl_material_clone(this._id);
    return this.engine.materials.wrap(index);
  }
  toString() {
    return this.isDestroyed ? "Material(destroyed)" : `Material('${this.pipeline}', ${this._index})`;
  }
  static wrap(engine2, index) {
    return engine2.materials.wrap(index);
  }
};
var MaterialManager = class extends ResourceManager {
  _materialTemplates = [];
  constructor(engine2) {
    super(engine2, Material), this._cacheDefinitions();
  }
  wrap(index) {
    if (index <= 0)
      return null;
    let cached = this._cache[index];
    if (cached)
      return cached;
    let definition = this.engine.wasm._wl_material_get_definition(index), Template = this._materialTemplates[definition], material = new Template(index);
    return this._wrapInstance(material);
  }
  getTemplate(pipeline) {
    let wasm = this.engine.wasm, index = wasm._wl_get_material_definition_index(wasm.tempUTF8(pipeline));
    if (!index)
      throw new Error(`Pipeline '${pipeline}' doesn't exist in the scene`);
    return this._materialTemplates[index];
  }
  _wrapInstance(instance) {
    if (this._cache[instance.index] = instance, !this.engine.legacyMaterialSupport)
      return instance;
    let proxy = new Proxy(instance, { get(target, prop) {
      if (!target.hasParameter(prop))
        return target[prop];
      let name = `get${capitalizeFirstUTF8(prop)}`;
      return target[name]();
    }, set(target, prop, value) {
      if (!target.hasParameter(prop))
        return target[prop] = value, true;
      let name = `set${capitalizeFirstUTF8(prop)}`;
      return target[name](value), true;
    } });
    return this._cache[instance.index] = proxy, proxy;
  }
  _cacheDefinitions() {
    let count = this.engine.wasm._wl_get_material_definition_count();
    for (let i = 1; i < count; ++i)
      this._materialTemplates[i] = this._createMaterialTemplate(i);
  }
  _createMaterialTemplate(definitionIndex) {
    let engine2 = this.engine, template = class extends Material {
      static Parameters = /* @__PURE__ */ new Set();
      constructor(index) {
        return index = index ?? engine2.wasm._wl_material_create(definitionIndex), super(engine2, index), engine2.materials._wrapInstance(this);
      }
    }, wasm = this.engine.wasm, nbParams = wasm._wl_material_definition_get_param_count(definitionIndex);
    for (let index = 0; index < nbParams; ++index) {
      let name = wasm.UTF8ToString(wasm._wl_material_definition_get_param_name(definitionIndex, index));
      template.Parameters.add(name);
      let t = wasm._wl_material_definition_get_param_type(definitionIndex, index), type = t & 255, componentCount = t >> 8 & 255, capitalized = capitalizeFirstUTF8(name), getterId = `get${capitalized}`, setterId = `set${capitalized}`, templateProto = template.prototype;
      switch (type) {
        case 0:
          templateProto[getterId] = uint32Getter(index, componentCount), templateProto[setterId] = uint32Setter(index);
          break;
        case 1:
          templateProto[getterId] = int32Getter(index, componentCount), templateProto[setterId] = uint32Setter(index);
          break;
        case 2:
        case 3:
          templateProto[getterId] = float32Getter(index, componentCount), templateProto[setterId] = float32Setter(index, componentCount);
          break;
        case 4:
          templateProto[getterId] = samplerGetter(index), templateProto[setterId] = samplerSetter(index);
          break;
        case 5:
          templateProto[getterId] = fontGetter(index);
          break;
      }
    }
    return template;
  }
};
function uint32Getter(index, count) {
  return count === 1 ? function() {
    let wasm = this.engine.wasm;
    return wasm._wl_material_get_param_value(this._id, index, wasm._tempMem), wasm._tempMemUint32[0];
  } : function(out = new Uint32Array(count)) {
    let wasm = this.engine.wasm;
    wasm._wl_material_get_param_value(this._id, index, wasm._tempMem);
    for (let i = 0; i < out.length; ++i)
      out[i] = wasm._tempMemUint32[i];
    return out;
  };
}
function uint32Setter(index) {
  return function(value) {
    this.engine.wasm._wl_material_set_param_value_uint(this._id, index, value);
  };
}
function int32Getter(index, count) {
  return count === 1 ? function() {
    let wasm = this.engine.wasm;
    return wasm._wl_material_get_param_value(this._id, index, wasm._tempMem), wasm._tempMemInt[0];
  } : function(out = new Int32Array(count)) {
    let wasm = this.engine.wasm;
    wasm._wl_material_get_param_value(this._id, index, wasm._tempMem);
    for (let i = 0; i < out.length; ++i)
      out[i] = wasm._tempMemInt[i];
    return out;
  };
}
function float32Getter(index, count) {
  return count === 1 ? function() {
    let wasm = this.engine.wasm;
    return wasm._wl_material_get_param_value(this._id, index, wasm._tempMem), wasm._tempMemFloat[0];
  } : function(out = new Float32Array(count)) {
    let wasm = this.engine.wasm;
    wasm._wl_material_get_param_value(this._id, index, wasm._tempMem);
    for (let i = 0; i < out.length; ++i)
      out[i] = wasm._tempMemFloat[i];
    return out;
  };
}
function float32Setter(index, count) {
  return function(value) {
    let wasm = this.engine.wasm, actualCount = 1;
    if (typeof value == "number")
      wasm._tempMemFloat[0] = value;
    else {
      actualCount = value.length;
      for (let i = 0; i < actualCount; ++i)
        wasm._tempMemFloat[i] = value[i];
    }
    if (actualCount < count)
      throw new Error(`Expected an array ${count} values, got ${actualCount}`);
    wasm._wl_material_set_param_value_float(this._id, index, wasm._tempMem, count);
  };
}
function samplerGetter(index) {
  return function() {
    let wasm = this.engine.wasm;
    return wasm._wl_material_get_param_value(this._id, index, wasm._tempMem), this.engine.textures.wrap(wasm._tempMemInt[0]);
  };
}
function samplerSetter(index) {
  return function(value) {
    this.engine.wasm._wl_material_set_param_value_uint(this._id, index, value?._id ?? 0);
  };
}
function fontGetter(index) {
  return function() {
    let wasm = this.engine.wasm;
    return wasm._wl_material_get_param_value(this._id, index, wasm._tempMem), this.engine.fonts.wrap(wasm._tempMemInt[0]);
  };
}
var MeshManager = class extends ResourceManager {
  constructor(engine2) {
    super(engine2, Mesh);
  }
  create(params) {
    if (!params.vertexCount)
      throw new Error("Missing parameter 'vertexCount'");
    let wasm = this.engine.wasm, indexData = 0, indexType = 0, indexDataSize = 0;
    if (params.indexData)
      switch (indexType = params.indexType || 2, indexDataSize = params.indexData.length * indexType, indexData = wasm._malloc(indexDataSize), indexType) {
        case 1:
          wasm.HEAPU8.set(params.indexData, indexData);
          break;
        case 2:
          wasm.HEAPU16.set(params.indexData, indexData >> 1);
          break;
        case 4:
          wasm.HEAPU32.set(params.indexData, indexData >> 2);
          break;
      }
    let { skinningType = 0 } = params, index = wasm._wl_mesh_create(indexData, indexDataSize, indexType, params.vertexCount, skinningType), instance = new Mesh(this._host, index);
    return this._cache[instance.index] = instance, instance;
  }
};
function needsFlipY(image) {
  return image instanceof ImageBitmap ? 0 : 1;
}
var TextureManager = class _TextureManager extends ResourceManager {
  constructor(engine2) {
    super(engine2, Texture);
  }
  static fetchImage(src, crossOrigin) {
    let url = src instanceof Blob ? URL.createObjectURL(src) : null, promise = new Promise((resolve, reject) => {
      let image = new Image();
      image.crossOrigin = crossOrigin ?? image.crossOrigin, image.addEventListener("load", () => resolve(image), { once: true }), image.addEventListener("error", (e) => reject(e), { once: true }), image.src = isString(src) ? src : url;
    });
    return url && promise.finally(() => URL.revokeObjectURL(url)), promise;
  }
  static fetchImageBitmap(src, options) {
    return src instanceof Blob ? createImageBitmap(src, options) : fetch(src).then((r) => r.blob()).then((b) => createImageBitmap(b, options));
  }
  create(image, params = {}) {
    let wasm = this.engine.wasm;
    if (image instanceof HTMLImageElement && !image.complete)
      throw new Error("image must be ready to create a texture");
    let jsImageIndex = wasm._images.length;
    wasm._images.push(image), wasm._imageSources.push(null);
    let width = image.videoWidth ?? image.width, height = image.videoHeight ?? image.height, border = params.border;
    if (border === void 0) {
      let threshold = wasm._wl_renderer_atlas_downscaleThreshold();
      border = threshold === 0 || Math.max(width, height) < threshold;
    }
    let imageIndex = wasm._wl_image_create(jsImageIndex, border);
    wasm._wl_image_markReady(imageIndex, width, height, needsFlipY(image));
    let index = wasm._wl_texture_create(imageIndex), instance = new Texture(this.engine, index);
    return this._cache[instance.index] = instance, instance;
  }
  load(filename, crossOrigin) {
    return _TextureManager.fetchImage(filename, crossOrigin).then((image) => this.create(image));
  }
};
var XRSessionState = class {
  #webxr;
  sessionMode;
  session;
  frame = null;
  constructor(webxr, mode, session) {
    this.#webxr = webxr, this.sessionMode = mode, this.session = session;
  }
  referenceSpaceForType(type) {
    return this.#webxr.referenceSpaceForType(type);
  }
  set currentReferenceSpace(refSpace) {
    this.#webxr.currentReferenceSpace = refSpace;
  }
  get currentReferenceSpace() {
    return this.#webxr.currentReferenceSpace;
  }
  get currentReferenceSpaceType() {
    return this.#webxr.currentReferenceSpaceType;
  }
  get baseLayer() {
    return this.#webxr.baseLayer;
  }
  get framebuffers() {
    return this.#webxr.framebuffers;
  }
};
var WebXR = class {
  #wasm;
  engine;
  sessionState = null;
  colorFormat = 32856;
  depthFormat = 36012;
  textureType = "texture";
  onSessionEnd = new Emitter();
  onSessionStart = new RetainEmitter();
  onSessionFirstFrame = new Emitter();
  arSupported = false;
  vrSupported = false;
  baseLayer = null;
  framebufferScaleFactor = 1;
  _webglBinding = null;
  _initXR = false;
  _inXR = false;
  _refSpaces = { viewer: void 0, local: void 0, "local-floor": void 0, "bounded-floor": void 0, unbounded: void 0 };
  _refSpace = null;
  _refSpaceType = null;
  _fbo = 0;
  _allowLayers = false;
  _requestAnimationFrameId = null;
  _initialReferenceSpaceType = null;
  _tempPosition = new Float32Array(3);
  _tempRotation = new Float32Array(4);
  _tempPose(transform) {
    let p = transform.position;
    this._tempPosition[0] = p.x, this._tempPosition[1] = p.y, this._tempPosition[2] = p.z;
    let o = transform.orientation;
    this._tempRotation[0] = o.x, this._tempRotation[1] = o.y, this._tempRotation[2] = o.z, this._tempRotation[3] = o.w;
  }
  constructor(engine2) {
    this.engine = engine2, this.#wasm = engine2.wasm;
  }
  checkXRSupport() {
    if (typeof navigator > "u")
      return Promise.resolve(false);
    if (!navigator.xr) {
      let isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1", missingHTTPS = location.protocol !== "https:" && !isLocalhost;
      return console.warn(missingHTTPS ? "WebXR is only supported with HTTPS or on localhost!" : "WebXR unsupported in this browser."), Promise.resolve(false);
    }
    let vrPromise = navigator.xr.isSessionSupported("immersive-vr").then((supported) => this.vrSupported = supported).catch(() => this.vrSupported = false), arPromise = navigator.xr.isSessionSupported("immersive-ar").then((supported) => this.arSupported = supported).catch(() => this.arSupported = false);
    return Promise.all([vrPromise, arPromise]).then(() => this.vrSupported || this.arSupported);
  }
  async init(framebufferScaleFactor, offerSessionOptions) {
    if (!await this.checkXRSupport())
      return;
    this.framebufferScaleFactor = framebufferScaleFactor;
    let onXRStart = () => {
      this._initialReferenceSpaceType = this.currentReferenceSpaceType;
      let newSpace = this._refSpaces.local ?? this._refSpaces.viewer;
      this.currentReferenceSpace = newSpace;
    };
    if (this.onSessionStart.add(onXRStart), this.engine.onLoadingScreenEnd.once(() => {
      this.onSessionStart.remove(onXRStart), this._initialReferenceSpaceType && (this.currentReferenceSpace = this._refSpaces[this._initialReferenceSpaceType] ?? this._refSpaces.viewer, this._initialReferenceSpaceType = null);
    }), offerSessionOptions !== null) {
      let mode = offerSessionOptions.mode;
      mode == "auto" && (this.vrSupported ? mode = "immersive-vr" : this.arSupported ? mode = "immersive-ar" : mode = "inline");
      let offerSession = () => {
        this.offerSession(mode, offerSessionOptions.features, offerSessionOptions.optionalFeatures).then((s) => s.addEventListener("end", offerSession)).catch(console.warn);
      };
      offerSession();
    }
  }
  referenceSpaceForType(type) {
    return this._refSpaces[type] ?? null;
  }
  set currentReferenceSpace(refSpace) {
    this._refSpace = refSpace, this._refSpaceType = null;
    for (let type of Object.keys(this._refSpaces))
      this._refSpaces[type] === refSpace && (this._refSpaceType = type);
  }
  get currentReferenceSpace() {
    return this._refSpace;
  }
  get currentReferenceSpaceType() {
    return this._refSpaceType;
  }
  get framebuffers() {
    return Array.isArray(this._fbo) ? this._fbo.map((id) => this.#wasm.GL.framebuffers[id]) : [this.#wasm.GL.framebuffers[this._fbo]];
  }
  updateViewState(inXR) {
    let scene = this.engine.scene;
    inXR = inXR ?? this._inXR, scene.mainView && (scene.mainView.active = !inXR), scene.leftEyeView && scene.rightEyeView && (scene.leftEyeView.active = inXR, scene.rightEyeView.active = inXR);
  }
  updateProjectionParams(near, far) {
    if (!this.sessionState)
      return;
    let scene = this.engine.scene;
    near ??= scene.leftEyeView.near, far ??= scene.leftEyeView.far;
    let reverseZ = !!this.engine.isReverseZEnabled;
    this.sessionState.session.updateRenderState({ depthNear: reverseZ ? far : near, depthFar: reverseZ ? near : far });
  }
  requestSession(mode, features, optionalFeatures = []) {
    let options = this.sessionOptions(features, optionalFeatures);
    return navigator.xr.requestSession(mode, options).then(async (s) => (await this.engine.canvas.getContext("webgl2").makeXRCompatible(), this.startSession(s, mode), s));
  }
  offerSession(mode, features, optionalFeatures = []) {
    if (!navigator.xr.offerSession)
      return Promise.reject("WebXR offerSession() unsupported in this browser.");
    let options = this.sessionOptions(features, optionalFeatures);
    return navigator.xr.offerSession(mode, options).then(async (s) => (await this.engine.canvas.getContext("webgl2").makeXRCompatible(), this.startSession(s, mode), s));
  }
  async startSession(session, mode) {
    if (session == this.sessionState?.session)
      return;
    this.sessionState = new XRSessionState(this, mode, session), session.addEventListener("end", () => {
      this.endSession();
    });
    let gl = this.engine.canvas.getContext("webgl2"), useLayers = this._allowLayers || session.enabledFeatures?.includes("layers");
    if (useLayers) {
      console.log("Using WebXR Layers API"), this._webglBinding = new XRWebGLBinding(session, gl);
      let layer = this.baseLayer = this._webglBinding.createProjectionLayer({ scaleFactor: this.framebufferScaleFactor, colorFormat: this.colorFormat, depthFormat: 0, textureType: this.textureType ? this.textureType : "texture-array" });
      session.updateRenderState({ layers: [layer] });
    } else {
      let layer = this.baseLayer = new XRWebGLLayer(session, gl, { framebufferScaleFactor: this.framebufferScaleFactor });
      session.updateRenderState({ baseLayer: layer });
    }
    let promises = [];
    for (let type of Object.keys(this._refSpaces))
      promises.push(session.requestReferenceSpace(type).then((refSpace) => (this._refSpaces[type] = refSpace, refSpace)));
    await Promise.allSettled(promises).then((results) => {
      for (let i = results.length - 1; i >= 0; --i) {
        let result = results[i];
        if (result.status !== "rejected") {
          this._refSpaceType = Object.keys(this._refSpaces)[i], this._refSpace = result.value;
          break;
        }
      }
    });
    let isVR = mode == "immersive-vr", scene = this.engine.scene;
    if (isVR && (!scene.leftEyeView || !scene.rightEyeView)) {
      console.error("sessionStart(): VR sessions require 1 classic view, a left and a right view");
      return;
    }
    this.updateViewState(true), this.updateProjectionParams(void 0, void 0), this.onSessionStart.notify(session, this.sessionState.sessionMode), this.#wasm._wl_reset_context(), console.log(`WebXR ${isVR ? "VR" : "AR"} session started`), this.sessionState.session.addEventListener("visibilitychange", (event) => {
      switch (event.session.visibilityState) {
        case "visible":
          this.#wasm._wl_xr_focus();
        case "visible-blurred":
          this.#wasm._wl_xr_blur();
        case "hidden":
          this.#wasm._wl_xr_hide();
      }
    }), this._initXR = true, this._requestAnimationFrameId = session.requestAnimationFrame(useLayers ? this.nextFrameLayers.bind(this) : this.nextFrameSingle.bind(this));
  }
  sessionOptions(requiredFeatures, optionalFeatures = []) {
    this._allowLayers && !optionalFeatures.includes("layers") && optionalFeatures.push("layers");
    let params = { requiredFeatures, optionalFeatures };
    return (requiredFeatures.includes("depth-sensing") || optionalFeatures.includes("depth-sensing")) && (params.depthSensing = { usagePreference: ["gpu-optimized", "cpu-optimized"], dataFormatPreference: ["float32", "luminance-alpha"] }), params;
  }
  endSession() {
    if (this.sessionState.session.cancelAnimationFrame(this._requestAnimationFrameId), this._requestAnimationFrameId = null, this.sessionState = null, this.baseLayer = null, this._webglBinding = null, Array.isArray(this._fbo)) {
      let gl = this.engine.canvas.getContext("webgl2"), GL = this.#wasm.GL;
      for (let id of this._fbo) {
        let framebuffer = GL.framebuffers[id];
        framebuffer && (gl.deleteFramebuffer(framebuffer), framebuffer.name = 0, GL.framebuffers[id] = null);
      }
    }
    this._fbo = 0, this.#wasm._wl_reset_context(), this.onSessionStart instanceof RetainEmitter && this.onSessionStart.reset(), this.onSessionEnd.notify(), console.log("WebXR session ended"), this._inXR = false, this.updateViewState(false);
    let scene = this.engine.scene;
    this.#wasm._wl_xr_exit(), scene.leftEyeView._generateProjectionMatrix(), scene.rightEyeView._generateProjectionMatrix(), this.#wasm._wl_application_redraw();
  }
  nextFrame(time, frame) {
    this.sessionState.frame = frame;
    let session = frame.session, pose = frame.getViewerPose(this._refSpace);
    if (!pose)
      return;
    let scene = this.engine.scene;
    if (this._initXR) {
      scene.rightEyeView.active = pose.views.length > 1;
      let useLayers = !session.renderState.baseLayer, isMultisampled = !useLayers || !!this.engine.canvas.getContext("webgl2").getExtension("WEBGL_multisampled_render_to_texture");
      this.#wasm._wl_xr_init(pose.views.length, useLayers, isMultisampled), this._initXR = false, this._inXR = true, this.onSessionFirstFrame.notify(session, this.sessionState.sessionMode);
    }
    this._tempPose(pose.transform), scene._setInputTransformation(0, this._tempPosition, this._tempRotation);
    for (let i = 0; i < pose.views.length && i < 2; ++i) {
      let view = pose.views[i], viewIndex = view.eye == "right" ? 1 : 0;
      this._tempPose(view.transform), scene._setInputTransformation(1 + viewIndex, this._tempPosition, this._tempRotation);
    }
    for (let inputSource of session.inputSources) {
      let handedness = -1;
      inputSource.handedness == "left" ? handedness = 0 : inputSource.handedness == "right" && (handedness = 1), this._updateInputComponent(frame, inputSource.gripSpace, 3 + handedness), this._updateInputComponent(frame, inputSource.targetRaySpace, 5 + handedness);
    }
    this.#wasm._wl_nextFrame(0);
  }
  nextFrameSingle(time, frame) {
    let session = frame.session;
    this.sessionState != null && (this._requestAnimationFrameId = session.requestAnimationFrame(this.nextFrameSingle.bind(this)));
    let pose = frame.getViewerPose(this._refSpace);
    if (!pose)
      return;
    let gl = this.engine.canvas.getContext("webgl2"), GL = this.#wasm.GL, glLayer = session.renderState.baseLayer;
    if (glLayer.framebuffer) {
      let id = this._fbo || GL.getNewId(GL.framebuffers);
      glLayer.framebuffer.name = id, GL.framebuffers[id] = glLayer.framebuffer, this._fbo = id, gl.bindFramebuffer(gl.FRAMEBUFFER, GL.framebuffers[id]);
    }
    for (let i = 0; i < pose.views.length; ++i) {
      let view = pose.views[i], viewport = glLayer.getViewport(view), destView;
      view.eye == "left" ? destView = this.engine.scene.leftEyeView : view.eye == "right" ? destView = this.engine.scene.rightEyeView : destView = this.engine.scene._components.componentAt(ViewComponent, i), destView._setViewport(viewport.x, viewport.y, viewport.width, viewport.height), destView._setProjectionMatrix(view.projectionMatrix), this.#wasm._wl_view_component_remapProjectionMatrix(destView._id, this.engine.isReverseZEnabled, false), this.#wasm._wl_view_component_set_externalFramebuffer(destView._id, this._fbo);
    }
    this.nextFrame(time, frame);
  }
  nextFrameLayers(time, frame) {
    let session = frame.session;
    this.sessionState != null && (this._requestAnimationFrameId = session.requestAnimationFrame(this.nextFrameLayers.bind(this)));
    let pose = frame.getViewerPose(this._refSpace), layer = this.baseLayer, binding = this._webglBinding, gl = this.engine.canvas.getContext("webgl2"), GL = this.#wasm.GL, createFramebuffer = !this._fbo, textureArray = layer.textureArrayLength > 1;
    createFramebuffer && (this._fbo = new Array(textureArray ? 2 : 1).fill(0).map(() => {
      let id = GL.getNewId(GL.framebuffers), framebuffer = gl.createFramebuffer();
      return GL.framebuffers[id] = framebuffer, framebuffer.name = id, id;
    }), textureArray || this._fbo.push(this._fbo[0]));
    let multisampleToTexture = gl.getExtension("WEBGL_multisampled_render_to_texture"), depthTexture = null, ids = this._fbo;
    pose.views.forEach((view) => {
      let viewIndex = view.eye == "right" ? 1 : 0, subImage = binding.getViewSubImage(layer, view), viewport = subImage.viewport, destView;
      if (view.eye == "right" ? destView = this.engine.scene.rightEyeView : destView = this.engine.scene.leftEyeView, destView._setViewport(viewport.x, viewport.y, viewport.width, viewport.height), destView._setProjectionMatrix(view.projectionMatrix), this.#wasm._wl_view_component_remapProjectionMatrix(destView._id, this.engine.isReverseZEnabled, false), this.#wasm._wl_view_component_set_externalFramebuffer(destView._id, ids[viewIndex]), !createFramebuffer)
        return;
      let needDepth = !!multisampleToTexture;
      if (needDepth && !depthTexture) {
        depthTexture = gl.createTexture();
        let depthImageId = depthTexture.name = GL.getNewId(GL.textures);
        GL.textures[depthImageId] = depthTexture;
        let target = textureArray ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D;
        gl.bindTexture(target, depthTexture), gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST), gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), textureArray ? gl.texStorage3D(target, 1, this.depthFormat, subImage.textureWidth, subImage.textureHeight, layer.textureArrayLength ?? 1) : gl.texStorage2D(target, 1, this.depthFormat, subImage.textureWidth, subImage.textureHeight), gl.bindTexture(target, null);
      }
      if (!textureArray && viewIndex != 0)
        return;
      let colorTexture = subImage.colorTexture, colorImageId = colorTexture.name = colorTexture.name || GL.getNewId(GL.textures);
      GL.textures[colorImageId] = colorTexture, gl.bindFramebuffer(gl.FRAMEBUFFER, GL.framebuffers[ids[viewIndex]]), textureArray ? (gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, subImage.colorTexture, 0, subImage.imageIndex), needDepth && gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, depthTexture, 0, subImage.imageIndex)) : multisampleToTexture ? (multisampleToTexture.framebufferTexture2DMultisampleEXT(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, subImage.colorTexture, 0, 4), needDepth && multisampleToTexture.framebufferTexture2DMultisampleEXT(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0, 4)) : (gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, subImage.colorTexture, 0), needDepth && gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)), gl.checkFramebufferStatus(gl.FRAMEBUFFER) || console.error("Target framebuffer for", view.eye, "eye is incomplete."), gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }), this.nextFrame(time, frame);
  }
  _updateInputComponent(frame, space, inputType) {
    if (!space)
      return;
    let pose = frame.getPose(space, this._refSpace);
    !pose || Number.isNaN(pose.transform.matrix[0]) || (this._tempPose(pose.transform), this.engine.scene._setInputTransformation(inputType, this._tempPosition, this._tempRotation));
  }
};
var GLTFExtensions = class {
  objectCount;
  root = {};
  mesh = {};
  node = {};
  constructor(count) {
    this.objectCount = count;
  }
};
var PrefabGLTF = class extends Prefab {
  extensions = null;
  constructor(engine2, index) {
    super(engine2, index), this.extensions = this._readExtensions();
  }
  _processInstantiaton(dest, root, result) {
    if (!this.extensions)
      return null;
    let wasm = this.engine.wasm, count = this.extensions.objectCount, idMapping = new Array(count), activeRootIndex = wasm._wl_object_index(root._id);
    for (let i = 0; i < count; ++i) {
      let mappedId = wasm._wl_glTF_scene_extensions_gltfIndex_to_id(this._index, dest._index, activeRootIndex, i);
      idMapping[i] = mappedId;
    }
    let remapped = { mesh: {}, node: {}, idMapping };
    for (let gltfIndex in this.extensions.mesh) {
      let id = idMapping[gltfIndex];
      remapped.mesh[id] = this.extensions.mesh[gltfIndex];
    }
    for (let gltfIndex in this.extensions.node) {
      let id = idMapping[gltfIndex];
      remapped.node[id] = this.extensions.node[gltfIndex];
    }
    result.extensions = remapped;
  }
  _readExtensions() {
    let wasm = this.engine.wasm, ptr = wasm._wl_glTF_scene_get_extensions(this._index);
    if (!ptr)
      return null;
    let index = ptr / 4, data = wasm.HEAPU32, readString = () => {
      let strPtr = data[index++], strLen = data[index++];
      return wasm.UTF8ViewToString(strPtr, strPtr + strLen);
    }, objectCount = data[index++], extensions = new GLTFExtensions(objectCount), meshExtensionsSize = data[index++];
    for (let i = 0; i < meshExtensionsSize; ++i) {
      let objectId = data[index++];
      extensions.mesh[objectId] = JSON.parse(readString());
    }
    let nodeExtensionsSize = data[index++];
    for (let i = 0; i < nodeExtensionsSize; ++i) {
      let objectId = data[index++];
      extensions.node[objectId] = JSON.parse(readString());
    }
    let rootExtensionsStr = readString();
    return rootExtensionsStr && (extensions.root = JSON.parse(rootExtensionsStr)), extensions;
  }
};
var MAGIC_BIN = "WLEV";
var SceneType = ((SceneType2) => (SceneType2[SceneType2.Prefab = 0] = "Prefab", SceneType2[SceneType2.Main = 1] = "Main", SceneType2[SceneType2.Dependency = 2] = "Dependency", SceneType2))(SceneType || {});
var ChunkedSceneLoadSink = class {
  #wasm;
  #type;
  #offset = 0;
  #requested = 0;
  #firstChunk = true;
  _loadIndex = -1;
  sceneIndex = -1;
  #ptr = 0;
  #bufferSize = 0;
  constructor(engine2, type, url) {
    this.#wasm = engine2.wasm, this.#type = type, this._loadIndex = this.#wasm._wl_scene_create_chunked_start(this.#wasm.tempUTF8(url)), this.#requested = this.#wasm._wl_scene_create_chunked_buffer_size(this._loadIndex), this._resizeBuffer(this.#requested);
  }
  _resizeBuffer(size) {
    this.#bufferSize > 0 && this.#wasm._free(this.#ptr), this.#bufferSize = size, this.#ptr = size ? this.#wasm._malloc(size) : 0;
  }
  _throwError(reason) {
    throw this.abort(), new Error(reason);
  }
  write(blob) {
    let read = 0;
    for (; read < blob.length; ) {
      let toRead = Math.min(blob.length - read, this.#bufferSize - this.#offset);
      if (this.#wasm.HEAPU8.set(blob.subarray(read, read + toRead), this.#ptr + this.#offset), this.#offset += toRead, read += toRead, this.#requested > this.#offset)
        continue;
      let readSizePtr = this.#wasm._tempMem, requestedPtr = this.#wasm._tempMem + 4, success;
      try {
        success = this.#wasm._wl_scene_create_chunked_next(this._loadIndex, this.#ptr, this.#offset, readSizePtr, requestedPtr);
      } catch {
        success = false;
      }
      success || this._throwError("Chunk parsing failed");
      let sentSize = this.#offset, readSize = this.#wasm._tempMemUint32[0];
      this.#requested = this.#wasm._tempMemUint32[1];
      let extraSize = sentSize - readSize;
      extraSize > this.#requested && this._throwError("Unexpected extra data"), readSize && (extraSize > 0 && this.#wasm.HEAPU8.copyWithin(this.#ptr, this.#ptr + readSize, this.#ptr + sentSize), this.#offset = extraSize, this.#firstChunk && (this._resizeBuffer(this.#wasm._wl_scene_create_chunked_buffer_size(this._loadIndex)), this.#firstChunk = false));
    }
  }
  close() {
    switch (this.#requested > 0 && this._throwError("Unexpected end of data"), this._resizeBuffer(0), this.#type) {
      case 0:
        this.sceneIndex = this.#wasm._wl_scene_create_chunked_end_prefab(this._loadIndex);
        break;
      case 1:
        this.#wasm._wl_scene_create_chunked_end_main(this._loadIndex), this.sceneIndex = 0;
        break;
      case 2:
        this.#wasm._wl_scene_create_chunked_end_queued(this._loadIndex);
        break;
      default:
        this.#wasm._wl_scene_create_chunked_abort(this._loadIndex);
        break;
    }
    this._loadIndex = -1;
  }
  abort() {
    this._loadIndex !== -1 && (this.#wasm._wl_scene_create_chunked_abort(this._loadIndex), this._loadIndex = -1, this._resizeBuffer(0));
  }
  get size() {
    return this.#bufferSize;
  }
};
var Scene = class _Scene extends Prefab {
  onPreRender = new Emitter();
  onPostRender = new Emitter();
  _rayHit;
  _hit;
  _environment;
  _ssao = new SSAO(this);
  _jsSystems = [];
  _componentTypeToSystem = [];
  _registrationVersion = Number.NEGATIVE_INFINITY;
  constructor(engine2, index) {
    super(engine2, index), this._rayHit = this.engine?.wasm._malloc(4 * (3 * 4 + 3 * 4 + 4 + 2) + 4), this._hit = new RayHit(this, this._rayHit), this._environment = new Environment(this);
  }
  instantiate(prefab) {
    if (prefab._index === this._index)
      throw new Error("Can't instantiate scene into itself");
    let id = this.engine.wasm._wl_scene_instantiate(prefab._index, this._index), result = { root: this.wrap(id) };
    if (prefab instanceof PrefabGLTF) {
      let obj = this.wrap(id);
      prefab._processInstantiaton(this, obj, result);
    }
    return result;
  }
  destroy() {
    if (this.isActive)
      throw new Error(`Attempt to destroy ${this}, but destroying the active scene is not supported`);
    let wasm = this.engine.wasm, rayPtr = this._rayHit;
    super.destroy(), wasm._free(rayPtr);
  }
  get views() {
    return this._components.components(ViewComponent, false);
  }
  get activeViews() {
    return this._components.components(ViewComponent, true);
  }
  get mainView() {
    let id = this.engine.wasm._wl_scene_get_mainView(this._index);
    return this._components.wrapView(id);
  }
  set mainView(view) {
    view && (this.assertOrigin(view), this.engine.wasm._wl_scene_set_mainView(view._id));
  }
  get leftEyeView() {
    let id = this.engine.wasm._wl_scene_get_leftView(this._index);
    return this._components.wrapView(id);
  }
  get rightEyeView() {
    let id = this.engine.wasm._wl_scene_get_rightView(this._index);
    return this._components.wrapView(id);
  }
  set probeVolumeScenario(scenario) {
    this.engine.wasm._wl_scene_set_probeVolumeScenario(this._index, scenario?._index ?? 0);
  }
  get probeVolumeScenario() {
    let index = this.engine.wasm._wl_scene_get_probeVolumeScenario(this._index);
    return this.engine.probeVolumeScenarios.wrap(index);
  }
  _setInputTransformation(type, position, orientation) {
    let wasm = this.engine.wasm;
    wasm.requireTempMem(4 * 2 * 4), wasm._tempMemFloat.set(position), wasm._tempMemFloat.set(orientation, 4), wasm._wl_input_set_transformation(this._index, type, wasm._tempMem);
  }
  rayCast(o, d, groupMask, maxDistance = 100) {
    return this.engine.wasm._wl_scene_ray_cast(this._index, o[0], o[1], o[2], d[0], d[1], d[2], groupMask, this._rayHit, maxDistance), this._hit;
  }
  set clearColor(color) {
    this.engine.wasm._wl_scene_set_clearColor(color[0], color[1], color[2], color[3]);
  }
  set colorClearEnabled(b) {
    this.engine.wasm._wl_scene_enableColorClear(b);
  }
  async load(options) {
    let engine2 = this.engine, dispatchReadyEvent = false, opts;
    isString(options) ? opts = await _Scene.loadBuffer(options, (bytes, size) => {
      this.engine.log.info(1, `Scene downloading: ${bytes} / ${size}`), this.engine.setLoadingProgress(bytes / size);
    }) : (opts = options, dispatchReadyEvent = options.dispatchReadyEvent ?? false);
    let scene = await engine2.loadMainSceneFromBuffer({ ...opts, dispatchReadyEvent });
    return engine2.onSceneLoaded.notify(), scene;
  }
  async append(file, options = {}) {
    let { baseURL = isString(file) ? getBaseUrl(file) : this.baseURL } = options, buffer = isString(file) ? await fetchWithProgress(file) : file, data = new Uint8Array(buffer), scene = data.byteLength > MAGIC_BIN.length && data.subarray(0, MAGIC_BIN.length).every((value, i) => value === MAGIC_BIN.charCodeAt(i)) ? this.engine.loadPrefabFromBuffer({ buffer, baseURL }) : await this.engine.loadGLTFFromBuffer({ buffer, baseURL, extensions: options.loadGltfExtensions }), result = this.instantiate(scene);
    return scene instanceof PrefabGLTF ? scene.extensions ? { root: result.root, extensions: { ...result.extensions, root: scene.extensions.root } } : result.root : (scene.destroy(), result.root);
  }
  setLoadingProgress(percentage) {
    this.engine.setLoadingProgress(percentage);
  }
  dispatchReadyEvent() {
    document.dispatchEvent(new CustomEvent("wle-scene-ready", { detail: { filename: this.filename } }));
  }
  set skyMaterial(material) {
    this.engine.wasm._wl_scene_set_sky_material(this._index, material?._id ?? 0);
  }
  get skyMaterial() {
    let index = this.engine.wasm._wl_scene_get_sky_material(this._index);
    return this.engine.materials.wrap(index);
  }
  get environment() {
    return this._environment;
  }
  get ssao() {
    return this._ssao;
  }
  get componentsBundle() {
    let wasm = this.engine.wasm, ptr = wasm._wl_scene_get_componentsBundle(this._index);
    return ptr ? wasm.UTF8ToString(ptr) : null;
  }
  reset() {
  }
  _runUpdateJs(dt) {
    this._cacheJsSystems(false);
    for (let s = 0; s < this._jsSystems.length; ++s) {
      let system = this._jsSystems[s];
      for (let i = 0; i < system.length; ++i) {
        let component = system[i];
        component.active && component._triggerUpdate(dt);
      }
    }
  }
  _activate() {
    this._cacheJsSystems(true), this.engine.wasm._wl_scene_activate(this._index);
  }
  _postDeactivate() {
    this._jsSystems.length = 0;
  }
  async _downloadDependencies() {
    let wasm = this.engine.wasm, count = wasm._wl_scene_queued_bin_count(this._index);
    if (!count)
      return Promise.resolve();
    let urls = new Array(count).fill(0).map((_, i) => {
      let ptr = wasm._wl_scene_queued_bin_path(this._index, i);
      return wasm.UTF8ToString(ptr);
    });
    return wasm._wl_scene_clear_queued_bin_list(this._index), Promise.all(urls.map((url) => this.engine._loadResourcesBin(url)));
  }
  _onComponentCreated(component, type) {
    if (!this.isActive)
      return;
    let systemIndex = this._componentTypeToSystem[type];
    if (systemIndex === null)
      return;
    this._jsSystems[systemIndex] || (this._jsSystems[systemIndex] = []);
    let system = this._jsSystems[systemIndex];
    component._indexInSystem = system.length, system.push(component);
  }
  _onComponentDestroyed(instance) {
    if (instance._indexInSystem === null || !this.isActive)
      return;
    let typeIndex = this.engine.wasm._componentTypeIndices[instance.type], systemIndex = this._componentTypeToSystem[typeIndex];
    if (systemIndex === null)
      return;
    let system = this._jsSystems[systemIndex], last = system.pop();
    last !== instance && (last._indexInSystem = instance._indexInSystem, system[last._indexInSystem] = last);
  }
  _cacheJsSystems(force) {
    let wasm = this.engine.wasm;
    if (this._registrationVersion !== this.engine._registrationVersion && (this._registrationVersion = this.engine._registrationVersion, this._sortComponentSystems(), force = true), !force)
      return;
    this._jsSystems.length = wasm._componentTypes.length;
    for (let i = 0; i < wasm._componentTypes.length; ++i)
      this._jsSystems[i] = [];
    let components = this._jsComponents;
    for (let component of components) {
      if (component.isDestroyed)
        continue;
      let typeIndex = wasm._componentTypeIndices[component.type];
      if (typeIndex === void 0)
        continue;
      let index = this._componentTypeToSystem[typeIndex];
      index !== null && (component._indexInSystem = this._jsSystems[index].length, this._jsSystems[index].push(component));
    }
  }
  _sortComponentSystems() {
    let wasm = this.engine.wasm, types = wasm._componentTypes, indices = wasm._componentTypeIndices, maxCount = types.length, dependencies = new Array(maxCount).fill(null).map((_) => []);
    for (let i = 1; i < maxCount; ++i) {
      let componentClass = types[i];
      if (componentClass.UpdateAfter) {
        let list = Array.isArray(componentClass.UpdateAfter) ? componentClass.UpdateAfter : componentClass.UpdateAfter(this.engine);
        for (let AfterClass of list) {
          let index = indices[AfterClass.TypeName];
          dependencies[i].push(index);
        }
      }
      if (componentClass.UpdateBefore) {
        let list = Array.isArray(componentClass.UpdateBefore) ? componentClass.UpdateBefore : componentClass.UpdateBefore(this.engine);
        for (let BeforeClass of list) {
          let index = indices[BeforeClass.TypeName];
          dependencies[index].push(i);
        }
      }
    }
    this._componentTypeToSystem.length = maxCount, this._componentTypeToSystem.fill(null);
    let order = 0, visited = new Array(maxCount).fill(false), rec = (index) => {
      if (visited[index])
        return;
      visited[index] = true;
      let dependency = dependencies[index];
      for (let i = 0; i < dependency.length; ++i)
        rec(dependency[i]);
      this._componentTypeToSystem[index] = order++;
    };
    for (let i = 1; i < maxCount; ++i)
      rec(i);
  }
};
var ProbeVolumeScenarioManager = class extends ResourceManager {
  constructor(engine2) {
    super(engine2, ProbeVolumeScenario);
  }
  async load(filename) {
    return await this.engine._loadResourcesBin(filename), this.find(filename);
  }
  find(filename) {
    let wasm = this.engine.wasm, ptr = wasm.tempUTF8(filename), index = wasm._wl_probeVolumeScenario_find(ptr);
    return this.wrap(index);
  }
};
var ParticleEffectManager = class extends ResourceManager {
  constructor(engine2) {
    super(engine2, ParticleEffect);
  }
  create(params) {
    if (!params.maxCount)
      throw new Error("Missing parameter 'maxCount'");
    if (params.maxCount < 0 || params.maxCount > 65535)
      throw new Error("'maxCount' must be between 0 and 65535");
    let index = this.engine.wasm._wl_particleEffect_create(params.maxCount, params.mesh?._id ?? 0, params.material?._id ?? 0, params.colors ?? false, params.instanceData ?? false), instance = new ParticleEffect(this._host, index);
    return this._cache[instance.index] = instance, instance;
  }
};
var PipelineManager = class extends ResourceManager {
  constructor(engine2) {
    super(engine2, Pipeline);
  }
  findByName(name) {
    let wasm = this.engine.wasm, namePtr = wasm.tempUTF8(name);
    return this.wrap(wasm._wl_pipeline_findByName(namePtr));
  }
};
function checkRuntimeCompatibility(version2) {
  let { major, minor } = version2, majorDiff = major - APIVersion.major, minorDiff = minor - APIVersion.minor;
  if (!majorDiff && !minorDiff)
    return;
  let error = `checkRuntimeCompatibility(): Version compatibility mismatch:
	\u2192 API and runtime compatibility is enforced on a patch level (versions x.y.*)
`;
  throw majorDiff < 0 || !majorDiff && minorDiff < 0 ? new Error(`${error}	\u2192 Please use a Wonderland Engine editor version >= ${APIVersion.major}.${APIVersion.minor}.*`) : new Error(`${error}	\u2192 Please use a new API version >= ${version2.major}.${version2.minor}.*`);
}
function reloadPage(engine2) {
  let session = engine2.xr?.session ?? null;
  if (!session) {
    location.reload();
    return;
  }
  session.end().then(() => location.reload());
}
var DestroyedPrefabInstance = createDestroyedProxy2("prefab/scene");
var WonderlandEngine = class {
  get onXRSessionEnd() {
    return this.#webxr.onSessionEnd;
  }
  get onXRSessionStart() {
    return this.#webxr.onSessionStart;
  }
  onResize = new Emitter();
  get arSupported() {
    return this.#webxr.arSupported;
  }
  get vrSupported() {
    return this.#webxr.vrSupported;
  }
  onLoadingScreenEnd = new RetainEmitter();
  onSceneLoaded = new Emitter();
  onSceneActivated = new Emitter();
  onHotReloadRequest = new Emitter();
  i18n = new I18N(this);
  get xr() {
    return this.#webxr.sessionState;
  }
  erasePrototypeOnDestroy = false;
  legacyMaterialSupport = true;
  autoHotReload = true;
  loadUncompressedImagesAsBitmap = true;
  _scenes = [];
  _scene;
  _registrationVersion = 0;
  _mainSceneVersion = 0;
  _textures;
  _materials;
  _meshes;
  _morphTargets;
  _fonts;
  _audioClips;
  _particleEffects;
  _pipelines;
  _probeVolumeScenarios;
  _uncompressedPromises = [];
  #wasm;
  #physics = null;
  #webxr;
  #resizeObserver = null;
  #bundleCache = /* @__PURE__ */ new Set();
  #jobUpdate = new Emitter();
  constructor(wasm, loadingScreen, withRenderer) {
    this.#wasm = wasm, this.#wasm._setEngine(this), this.#wasm._loadingScreen = loadingScreen;
    let version2 = this.runtimeVersion, versionString = `${version2.major}.${version2.minor}.${version2.patch}`;
    version2.rc > 0 && (versionString += `-rc${version2.rc}`), this.log.info(0, "Wonderland Engine runtime version:", versionString), this.#webxr = new WebXR(this), checkRuntimeCompatibility(this.#wasm.runtimeVersion), this.#wasm._wl_set_error_callback(this.#wasm.addFunction((messagePtr) => {
      throw new Error(this.#wasm.UTF8ToString(messagePtr));
    }, "vi")), this.#wasm._wl_application_create(), this.#physics = null, this.#wasm.withPhysX && (this.#physics = new Physics(this)), this._init(withRenderer), this._scene = this._reload(0), this.#wasm._wl_set_jobUpdate_callback(this.#wasm.addFunction((jobId, status) => {
      this.#jobUpdate.notify(jobId, status);
    }, "vii")), this.canvas.addEventListener("webglcontextlost", (e) => this.log.error(0, "Context lost:", e), false);
  }
  start() {
    this.wasm._wl_application_start();
  }
  destroy() {
    this.wasm._wl_application_exit(), requestAnimationFrame(() => {
      this.wasm._wl_application_destroy();
    });
  }
  registerComponent(...classes) {
    for (let arg of classes)
      this.wasm._registerComponent(arg);
    ++this._registrationVersion;
  }
  async registerBundle(url, nocache = false) {
    if (!nocache && this.#bundleCache.has(url))
      return;
    this.#bundleCache.add(url), nocache && (url += `?t=${Date.now()}`);
    let register = (await import(url)).default;
    if (typeof register != "function")
      throw new Error(`The bundle '${url}' doesn't have a default exported registration function`);
    register(this);
  }
  setLoadingProgress(percentage) {
    this.wasm._wl_set_loading_screen_progress(clamp(percentage, 0, 1));
  }
  async switchTo(scene, opts = {}) {
    this.wasm._wl_deactivate_activeScene();
    let previous = this.scene;
    previous._postDeactivate(), this._preactivate(scene), scene._activate(), this.#webxr.updateViewState(void 0), this.#webxr.updateProjectionParams(void 0, void 0), this.onLoadingScreenEnd.isDataRetained || this.onLoadingScreenEnd.notify();
    let promises = [], promise = scene._downloadDependencies();
    promises.push(promise);
    let scenario = scene.probeVolumeScenario;
    if (scenario) {
      let scenarioPromise = scenario.loaded ? Promise.resolve(scenario) : this.probeVolumeScenarios.load("scenario.data.bin");
      scenarioPromise = scenarioPromise.then((s) => this.scene.probeVolumeScenario = s), promises.push(scenarioPromise);
    }
    await this.i18n.setLanguage(this.i18n.languageCode(0));
    let { dispatchReadyEvent = false, waitForDependencies = false } = opts;
    waitForDependencies && await Promise.all(promises), this.onSceneActivated.notify(previous, scene), dispatchReadyEvent && scene.dispatchReadyEvent();
  }
  async loadMainScene(options, progress) {
    progress ??= (bytes, size) => {
      this.log.info(1, `Scene downloading: ${bytes} / ${size}`), this.setLoadingProgress(bytes / size);
    };
    let opts = Prefab.makeUrlLoadOptions(options), { streamed = true, nocache = false } = opts;
    if (streamed) {
      let options2 = await Scene.loadStream(opts, progress), { stream, url } = Prefab.validateStreamOptions(options2);
      return this._loadMainScene(stream, url, nocache, options2);
    } else {
      let options2 = await Scene.loadBuffer(opts, progress);
      return this.loadMainSceneFromBuffer(options2);
    }
  }
  async loadMainSceneFromBuffer(options) {
    let { nocache = false } = options, { buffer, url } = Prefab.validateBufferOptions(options);
    return this._loadMainScene(buffer, url, nocache, options);
  }
  async loadPrefab(options, progress) {
    let opts = Prefab.makeUrlLoadOptions(options), { streamed = true } = opts;
    if (streamed) {
      let options2 = await Scene.loadStream(opts, progress), scene = await this._loadSceneFromStream(Prefab, options2);
      return this._validateLoadedPrefab(scene), scene._initialize(), scene;
    } else {
      let options2 = await Scene.loadBuffer(opts, progress);
      return this.loadPrefabFromBuffer(options2);
    }
  }
  loadPrefabFromBuffer(options) {
    let scene = this._loadSceneFromBuffer(Prefab, options);
    return this._validateLoadedPrefab(scene), scene._initialize(), scene;
  }
  async loadScene(options, progress) {
    let opts = Prefab.makeUrlLoadOptions(options), { streamed = true } = opts;
    if (streamed) {
      let options2 = await Scene.loadStream(opts, progress), scene = await this._loadSceneFromStream(Scene, options2);
      return this._validateLoadedScene(scene), scene._initialize(), scene;
    } else {
      let options2 = await Scene.loadBuffer(opts, progress);
      return this.loadSceneFromBuffer(options2);
    }
  }
  async loadGLTF(opts, progress) {
    let memOptions = await Scene.loadBuffer(opts, progress), options = isString(opts) ? memOptions : { ...opts, ...memOptions };
    return this.loadGLTFFromBuffer(options);
  }
  loadSceneFromBuffer(options) {
    let scene = this._loadSceneFromBuffer(Scene, options);
    return this._validateLoadedScene(scene), scene._initialize(), scene;
  }
  loadGLTFFromBuffer(options) {
    Scene.validateBufferOptions(options);
    let { buffer, extensions = false, generateSimpleTangents = false, async = false } = options, wasm = this.wasm;
    if (!wasm._wl_glTF_scene_create)
      throw new Error("Loading .gltf files requires `enableRuntimeGltf` to be checked in the editor Project Settings.");
    let ptr = wasm.copyBufferToHeap(buffer), index = null;
    try {
      index = wasm._wl_glTF_scene_create(extensions, generateSimpleTangents, async, ptr, buffer.byteLength);
    } catch (e) {
      throw wasm._free(ptr), e;
    }
    if (!index)
      throw wasm._free(ptr), new Error("Internal gltf loading error");
    if (async) {
      let jobId = SceneResource._unpackId(index), sceneIndex = SceneResource._unpackSceneIndex(index);
      return this._awaitJob(jobId).then(() => this._createPrefabGLTF(sceneIndex)).finally(() => {
        wasm._free(ptr);
      });
    }
    return wasm._free(ptr), this._createPrefabGLTF(index);
  }
  isRegistered(typeOrClass) {
    return this.#wasm.isRegistered(isString(typeOrClass) ? typeOrClass : typeOrClass.TypeName);
  }
  getComponentClass(typename) {
    let index = this.wasm._componentTypeIndices[typename];
    return index === void 0 ? null : this.wasm._componentTypes[index];
  }
  resize(width, height, devicePixelRatio = window.devicePixelRatio) {
    width = width * devicePixelRatio, height = height * devicePixelRatio, this.canvas.width = width, this.canvas.height = height, this.wasm._wl_application_resize(width, height), this.onResize.notify();
  }
  nextFrame(fixedDelta = 0) {
    this.#wasm._wl_nextFrame(fixedDelta);
  }
  requestXRSession(mode, features, optionalFeatures = []) {
    return this.#webxr.requestSession(mode, features, optionalFeatures);
  }
  offerXRSession(mode, features, optionalFeatures = []) {
    return this.#webxr.offerSession(mode, features, optionalFeatures);
  }
  wrapObject(objectId) {
    return this.scene.wrap(objectId);
  }
  toString() {
    return "engine";
  }
  get scene() {
    return this._scene;
  }
  get wasm() {
    return this.#wasm;
  }
  get webxr() {
    return this.#webxr;
  }
  get canvas() {
    return this.#wasm.canvas;
  }
  get xrSession() {
    return this.xr?.session ?? null;
  }
  get xrFrame() {
    return this.xr?.frame ?? null;
  }
  get xrBaseLayer() {
    return this.xr?.baseLayer ?? null;
  }
  get xrFramebuffer() {
    return this.xr?.framebuffers[0] ?? null;
  }
  get xrFramebufferScaleFactor() {
    return this.#webxr.framebufferScaleFactor;
  }
  set xrFramebufferScaleFactor(value) {
    this.#webxr.framebufferScaleFactor = value;
  }
  get physics() {
    return this.#physics;
  }
  get textures() {
    return this._textures;
  }
  get materials() {
    return this._materials;
  }
  get meshes() {
    return this._meshes;
  }
  get morphTargets() {
    return this._morphTargets;
  }
  get fonts() {
    return this._fonts;
  }
  get particleEffects() {
    return this._particleEffects;
  }
  get pipelines() {
    return this._pipelines;
  }
  get probeVolumeScenarios() {
    return this._probeVolumeScenarios;
  }
  get audioClips() {
    return this._audioClips;
  }
  get images() {
    let wasm = this.wasm, max2 = wasm._tempMemSize >> 1, count = wasm._wl_get_images(wasm._tempMem, max2), result = new Array(count);
    for (let i = 0; i < count; ++i) {
      let index = wasm._tempMemUint16[i];
      result[i] = wasm._images[index];
    }
    return result;
  }
  get imagesPromise() {
    let wasm = this.wasm, max2 = wasm._tempMemSize >> 1, count = wasm._wl_get_images(wasm._tempMem, max2), result = new Array(count);
    for (let i = 0; i < count; ++i) {
      let index = wasm._tempMemUint16[i], loading = this._uncompressedPromises[index];
      result[i] = (loading ?? Promise.resolve()).then(() => wasm._images[index]);
    }
    return Promise.all(result);
  }
  get isTextureStreamingIdle() {
    return !!this.wasm._wl_renderer_streaming_idle();
  }
  get isReverseZEnabled() {
    return !!this.wasm._wl_renderer_isReverseZEnabled();
  }
  set autoResizeCanvas(flag) {
    if (!!this.#resizeObserver !== flag) {
      if (!flag) {
        this.#resizeObserver?.unobserve(this.canvas), this.#resizeObserver = null;
        return;
      }
      this.#resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries)
          entry.target === this.canvas && this.resize(entry.contentRect.width, entry.contentRect.height);
      }), this.#resizeObserver.observe(this.canvas);
    }
  }
  get autoResizeCanvas() {
    return this.#resizeObserver !== null;
  }
  get runtimeVersion() {
    return this.#wasm.runtimeVersion;
  }
  get log() {
    return this.#wasm._log;
  }
  get graphicsApi() {
    return this.#wasm.preinitializedWebGPUDevice !== null ? 1 : 0;
  }
  _init(withRenderer) {
    if (!this.#wasm._wl_application_init(withRenderer))
      throw new Error("Failed to initializing Wonderland runtime");
    return this.resize(this.canvas.clientWidth, this.canvas.clientHeight), true;
  }
  _reset() {
    return this.wasm.reset(), this._scenes.length = 0, this._scene = this._reload(0), this.#bundleCache.clear(), this._registrationVersion = 0, ++this._mainSceneVersion, this.switchTo(this._scene);
  }
  async _reloadRequest(filename) {
    if (filename === null) {
      reloadPage(this);
      return;
    }
    try {
      this.autoHotReload && await this.loadMainScene({ url: filename, nocache: true });
    } catch (e) {
      console.error("Hot reload request failed to load main scene, reason:", e), setTimeout(() => reloadPage(this), 1e3);
      return;
    }
    this.onHotReloadRequest.notify(filename);
  }
  _createEmpty() {
    let index = this.wasm._wl_scene_create_empty(), scene = new Scene(this, index);
    return this._scenes[index] = scene, scene;
  }
  _destroyScene(instance) {
    this.wasm._wl_scene_destroy(instance._index);
    let index = instance._index;
    instance._index = -1, this.erasePrototypeOnDestroy && Object.setPrototypeOf(instance, DestroyedPrefabInstance), this._scenes[index] = null;
  }
  async _loadResourcesBin(url) {
    let sink = new ChunkedSceneLoadSink(this, 2, url);
    return (await fetchStreamWithProgress(url)).pipeTo(new WritableStream(sink));
  }
  _reload(index) {
    let scene = new Scene(this, index);
    return this._scenes[index] = scene, this._textures = new TextureManager(this), this._materials = new MaterialManager(this), this._meshes = new MeshManager(this), this._morphTargets = new ResourceManager(this, MorphTargets), this._fonts = new ResourceManager(this, Font), this._audioClips = new ResourceManager(this, AudioClip), this._particleEffects = new ParticleEffectManager(this), this._pipelines = new PipelineManager(this), this._probeVolumeScenarios = new ProbeVolumeScenarioManager(this), this._uncompressedPromises.length = 0, scene;
  }
  async _loadMainScene(data, url, nocache, options) {
    nocache && (url += `?t=${Date.now()}`);
    let wasm = this.#wasm, isLoadingScreen = this._mainSceneVersion === 0;
    if (++this._mainSceneVersion, !isLoadingScreen) {
      wasm._wl_deactivate_activeScene();
      for (let i = this._scenes.length - 1; i >= 0; --i) {
        let scene = this._scenes[i];
        scene && scene.destroy();
      }
    }
    this._textures._clear(), this._materials._clear(), this._meshes._clear(), this._morphTargets._clear(), this._uncompressedPromises.length = 0, this._registrationVersion = 0;
    let stream = data instanceof ReadableStream ? data : new ReadableStream(new ArrayBufferSource(data)), sink = new ChunkedSceneLoadSink(this, 1, url);
    await stream.pipeTo(new WritableStream(sink));
    let mainScene = this._reload(sink.sceneIndex);
    this._loadUncompressedImages(mainScene._index), this._preactivate(mainScene);
    let componentsBundle = mainScene.componentsBundle;
    if (componentsBundle) {
      let bundleURL = new URL(componentsBundle, document.baseURI), url2 = nocache ? bundleURL.href.split("?")[0] : bundleURL.href;
      await this.registerBundle(url2, nocache);
    }
    return mainScene._initialize(), await this.switchTo(mainScene, options), mainScene;
  }
  _loadSceneFromBuffer(PrefabClass, options) {
    let { buffer, url } = Scene.validateBufferOptions(options), sink = new ChunkedSceneLoadSink(this, 0, url);
    sink.write(new Uint8Array(buffer)), sink.close();
    let index = sink.sceneIndex, scene = new PrefabClass(this, index);
    return this._scenes[index] = scene, this._loadUncompressedImages(scene._index), scene;
  }
  async _loadSceneFromStream(PrefabClass, options) {
    let { stream, url } = Scene.validateStreamOptions(options), sink = new ChunkedSceneLoadSink(this, 0, url);
    await stream.pipeTo(new WritableStream(sink));
    let index = sink.sceneIndex, scene = new PrefabClass(this, index);
    return this._scenes[index] = scene, this._loadUncompressedImages(scene._index), scene;
  }
  _validateLoadedPrefab(scene) {
    if (this.wasm._wl_scene_activatable(scene._index))
      throw this.wasm._wl_scene_destroy(scene._index), new Error("File is not a prefab. To load a scene, use loadScene() instead");
  }
  _validateLoadedScene(scene) {
    if (!this.wasm._wl_scene_activatable(scene._index))
      throw this.wasm._wl_scene_destroy(scene._index), new Error("File is not a scene. To load a prefab, use loadPrefab() instead");
  }
  _preactivate(scene) {
    this._scene = scene, this.physics && (this.physics._hit._scene = scene);
  }
  _createPrefabGLTF(index) {
    let scene = new PrefabGLTF(this, index);
    return this._scenes[scene._index] = scene, this._loadUncompressedImages(scene._index), scene;
  }
  _loadUncompressedImages(sceneIndex) {
    let mainSceneVersion = this._mainSceneVersion, wasm = this.wasm, bitmapOptions = { colorSpaceConversion: "none", imageOrientation: "flipY" }, imageCount = wasm._wl_resource_count(3);
    for (let i = 1; i < imageCount; ++i) {
      if (wasm._wl_resource_originScene(3, i) !== sceneIndex)
        continue;
      let jsImageIndex = wasm._wl_image_get_jsImage_index(i);
      if (!jsImageIndex)
        continue;
      let src = wasm._imageSources[jsImageIndex];
      if (!src)
        continue;
      let promise = this.loadUncompressedImagesAsBitmap ? TextureManager.fetchImageBitmap(src, bitmapOptions) : TextureManager.fetchImage(src);
      promise.finally(() => {
        this._mainSceneVersion === mainSceneVersion && (wasm._imageSources[jsImageIndex] = null);
      }), this._uncompressedPromises[jsImageIndex] = promise.then((img) => {
        this._mainSceneVersion === mainSceneVersion && (wasm._images[jsImageIndex] = img, wasm._wl_image_markReady(i, img.width, img.height, needsFlipY(img)));
      }).catch((e) => {
        this._mainSceneVersion === mainSceneVersion && this.log.error(1, "Failed to load uncompressed image", e);
      });
    }
  }
  _awaitJob(targetJobId) {
    return new Promise((resolve, reject) => {
      let onJobUpdate = (id, status) => {
        id === targetJobId && (this.#jobUpdate.remove(onJobUpdate), status === 1 ? resolve() : reject());
      };
      this.#jobUpdate.add(onJobUpdate);
    });
  }
};
function assert(bit) {
  if (bit >= 32)
    throw new Error(`BitSet.enable(): Value ${bit} is over 31`);
}
var BitSet = class {
  _bits = 0;
  enable(...bits) {
    for (let bit of bits)
      assert(bit), this._bits |= 1 << bit >>> 0;
    return this;
  }
  enableAll() {
    return this._bits = -1, this;
  }
  disable(...bits) {
    for (let bit of bits)
      assert(bit), this._bits &= ~(1 << bit >>> 0);
    return this;
  }
  disableAll() {
    return this._bits = 0, this;
  }
  enabled(bit) {
    return !!(this._bits & 1 << bit >>> 0);
  }
};
var LogLevel = ((LogLevel2) => (LogLevel2[LogLevel2.Info = 0] = "Info", LogLevel2[LogLevel2.Warn = 1] = "Warn", LogLevel2[LogLevel2.Error = 2] = "Error", LogLevel2))(LogLevel || {});
var Logger = class {
  levels = new BitSet();
  tags = new BitSet().enableAll();
  onLog = new Emitter();
  constructor(...levels) {
    this.levels.enable(...levels);
  }
  info(tag, ...msg) {
    return this.levels.enabled(0) && this.tags.enabled(tag) && console.log(...msg), this.onLog.notify(0, msg, tag), this;
  }
  warn(tag, ...msg) {
    return this.levels.enabled(1) && this.tags.enabled(tag) && console.warn(...msg), this.onLog.notify(1, msg, tag), this;
  }
  error(tag, ...msg) {
    return this.levels.enabled(2) && this.tags.enabled(tag) && console.error(...msg), this.onLog.notify(2, msg, tag), this;
  }
};
var WASM = class {
  wasm = null;
  canvas = null;
  preinitializedWebGPUDevice = null;
  UTF8ViewToString;
  _log = new Logger();
  _deactivate_component_on_error = false;
  _tempMem = null;
  _tempMemSize = 0;
  _tempMemFloat = null;
  _tempMemInt = null;
  _tempMemUint8 = null;
  _tempMemUint32 = null;
  _tempMemUint16 = null;
  _loadingScreen = null;
  _sceneLoadedCallback = [];
  _images = [null];
  _imageSources = [null];
  _components = null;
  _componentTypes = [];
  _componentTypeIndices = {};
  _engine = null;
  _withPhysX = false;
  _utf8Decoder = new TextDecoder("utf8");
  _brokenComponentIndex = 0;
  constructor(threads2) {
    threads2 ? this.UTF8ViewToString = (s, e) => s ? this._utf8Decoder.decode(this.HEAPU8.slice(s, e)) : "" : this.UTF8ViewToString = (s, e) => s ? this._utf8Decoder.decode(this.HEAPU8.subarray(s, e)) : "", this._brokenComponentIndex = this._registerComponent(BrokenComponent);
  }
  get runtimeVersion() {
    let tempBuf = this._malloc(8), tempVersion = new Uint16Array(this.HEAP8.buffer, tempBuf, 4);
    this._wl_runtime_version(tempBuf);
    let version2 = { major: tempVersion[0], minor: tempVersion[1], patch: tempVersion[2], rc: tempVersion[3] };
    return this._free(tempBuf), version2;
  }
  reset() {
    this._wl_reset(), this._components = null, this._images.length = 1, this._imageSources.length = 1, this.allocateTempMemory(1024), this._componentTypes = [], this._componentTypeIndices = {}, this._brokenComponentIndex = this._registerComponent(BrokenComponent);
  }
  isRegistered(type) {
    return type in this._componentTypeIndices;
  }
  _registerComponentLegacy(typeName, params, object) {
    let ctor = class extends Component3 {
    };
    return ctor.TypeName = typeName, ctor.Properties = params, Object.assign(ctor.prototype, object), this._registerComponent(ctor);
  }
  _registerComponent(ctor) {
    if (!ctor.TypeName)
      throw new Error("no name provided for component.");
    if (!ctor.prototype._triggerInit)
      throw new Error(`registerComponent(): Component ${ctor.TypeName} must extend Component`);
    setupComponentClass(ctor);
    let typeIndex = ctor.TypeName in this._componentTypeIndices ? this._componentTypeIndices[ctor.TypeName] : this._componentTypes.length;
    return this._componentTypes[typeIndex] = ctor, this._componentTypeIndices[ctor.TypeName] = typeIndex, ctor === BrokenComponent || (this._log.info(0, "Registered component", ctor.TypeName, `(class ${ctor.name})`, "with index", typeIndex), ctor.onRegister && ctor.onRegister(this._engine)), typeIndex;
  }
  allocateTempMemory(size) {
    this._log.info(0, "Allocating temp mem:", size), this._tempMemSize = size, this._tempMem && this._free(this._tempMem), this._tempMem = this._malloc(this._tempMemSize), this.updateTempMemory();
  }
  requireTempMem(size) {
    this._tempMemSize >= size || this.allocateTempMemory(Math.ceil(size / 1024) * 1024);
  }
  updateTempMemory() {
    this._tempMemFloat = new Float32Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize >> 2), this._tempMemInt = new Int32Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize >> 2), this._tempMemUint32 = new Uint32Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize >> 2), this._tempMemUint16 = new Uint16Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize >> 1), this._tempMemUint8 = new Uint8Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize);
  }
  getTempBufferU8(count) {
    return this.requireTempMem(count), this._tempMemUint8;
  }
  getTempBufferU16(count) {
    return this.requireTempMem(count * 2), this._tempMemUint16;
  }
  getTempBufferU32(count) {
    return this.requireTempMem(count * 4), this._tempMemUint32;
  }
  getTempBufferI32(count) {
    return this.requireTempMem(count * 4), this._tempMemInt;
  }
  getTempBufferF32(count) {
    return this.requireTempMem(count * 4), this._tempMemFloat;
  }
  tempUTF8(str5, byteOffset = 0) {
    let strLen = this.lengthBytesUTF8(str5) + 1;
    this.requireTempMem(strLen + byteOffset);
    let ptr = this._tempMem + byteOffset;
    return this.stringToUTF8(str5, ptr, strLen), ptr;
  }
  copyBufferToHeap(buffer) {
    let size = buffer.byteLength, ptr = this._malloc(size);
    return this.HEAPU8.set(new Uint8Array(buffer), ptr), ptr;
  }
  get withPhysX() {
    return this._withPhysX;
  }
  _setEngine(engine2) {
    this._engine = engine2;
  }
  _wljs_reload(filenamePtr) {
    let filename = filenamePtr ? this.UTF8ToString(filenamePtr) : null;
    this._engine._reloadRequest(filename);
  }
  _wljs_init(withPhysX) {
    this._withPhysX = withPhysX, this.allocateTempMemory(1024);
  }
  _wljs_scene_switch(index) {
    let scene = this._engine._scenes[index];
    this._components = scene?._jsComponents ?? null;
  }
  _wljs_destroy_image(index) {
    let img = this._images[index];
    img && (this._images[index] = null, img.src !== void 0 && (img.src = ""), img.onload !== void 0 && (img.onload = null), img.onerror !== void 0 && (img.onerror = null));
  }
  _wljs_objects_markDestroyed(sceneIndex, idsPtr, count) {
    let scene = this._engine._scenes[sceneIndex], start = idsPtr >>> 1;
    for (let i = 0; i < count; ++i) {
      let id = this.HEAPU16[start + i];
      scene._destroyObject(id);
    }
  }
  _wljs_scene_initialize(sceneIndex, idsPtr, idsEnd, paramDataPtr, paramDataEndPtr, offsetsPtr, offsetsEndPtr) {
    let cborEncoded = this.HEAPU8.subarray(paramDataPtr, paramDataEndPtr), offsets = this.HEAPU32.subarray(offsetsPtr >>> 2, offsetsEndPtr >>> 2), ids = this.HEAPU16.subarray(idsPtr >>> 1, idsEnd >>> 1), scene = this._engine._scenes[sceneIndex], components = scene._jsComponents, cbor = new CBORReader(cborEncoded), componentsCount = 0;
    {
      let typeInfo = cbor.readTypeInfo();
      if (getType(typeInfo) !== 0) {
        this._log.error(0, "Parameters data must be an array");
        return;
      }
      componentsCount = cbor.readArrayLength(typeInfo);
    }
    if (componentsCount !== ids.length) {
      this._log.error(0, `Parameters set for ${componentsCount} components, but expected ${ids.length}`);
      return;
    }
    let decoder = new ComponentPropertyDecoder(scene, offsets);
    for (let i = 0; i < componentsCount; ++i) {
      let id = Component3._pack(sceneIndex, ids[i]), index = this._wl_get_js_component_index_for_id(id), component = components[index];
      decoder.decode(cbor, component);
    }
  }
  _wljs_set_component_param_translation(scene, component, param, valuePtr, valueEndPtr) {
    let comp = this._engine._scenes[scene]._jsComponents[component], value = this.UTF8ViewToString(valuePtr, valueEndPtr), paramName = comp.constructor._propertyOrder[param];
    comp[paramName] = value;
  }
  _wljs_get_component_type_index(namePtr, nameEndPtr) {
    let typename = this.UTF8ViewToString(namePtr, nameEndPtr), index = this._componentTypeIndices[typename];
    return index === void 0 ? this._brokenComponentIndex : index;
  }
  _wljs_component_create(sceneIndex, index, id, type, object) {
    this._engine._scenes[sceneIndex]._createComponentJs(index, id, type, object);
  }
  _wljs_component_init(scene, component) {
    this._engine._scenes[scene]._jsComponents[component]._triggerInit();
  }
  _wljs_component_onActivate(component) {
    this._components[component]._triggerOnActivate();
  }
  _wljs_component_onDeactivate(component) {
    this._components[component]._triggerOnDeactivate();
  }
  _wljs_component_markDestroyed(sceneIndex, manager, componentId) {
    this._engine._scenes[sceneIndex]._destroyComponent(manager, componentId);
  }
  _wljs_swap(scene, a, b) {
    let components = this._engine._scenes[scene]._jsComponents, componentA = components[a];
    components[a] = components[b], components[b] = componentA;
  }
  _wljs_copy(srcSceneIndex, srcIndex, dstSceneIndex, dstIndex, offsetsPtr, copyInfoPtr) {
    let srcScene = this._engine._scenes[srcSceneIndex], destComp = this._engine._scenes[dstSceneIndex]._jsComponents[dstIndex], srcComp = srcScene._jsComponents[srcIndex];
    destComp._copy(srcComp, offsetsPtr, copyInfoPtr);
  }
  _wljs_scene_postUpdate(dt) {
    this._engine.scene._runUpdateJs(dt);
  }
  _wljs_trigger_animationEvent(componentId, namePtr, nameEndPtr) {
    let comp = this._engine.scene._components.wrapAnimation(componentId), nameStr = this.UTF8ViewToString(namePtr, nameEndPtr);
    comp.onEvent.notify(nameStr);
  }
  _wljs_renderer_onPreRenderDraw(pipelineId) {
    let pipeline = this._engine.pipelines.wrap(pipelineId);
    pipeline && pipeline.onPreRender.notify();
  }
  _wljs_renderer_onPostRenderDraw(pipelineId) {
    let pipeline = this._engine.pipelines.wrap(pipelineId);
    pipeline && pipeline.onPostRender.notify();
  }
};
function throwInvalidRuntime(version2) {
  return function() {
    throw new Error(`Feature added in version ${version2}.
	\u2192 Please use a Wonderland Engine editor version >= ${version2}`);
  };
}
var requireRuntime1_5_1 = throwInvalidRuntime("1.5.1");
WASM.prototype._wl_pipeline_get_name = requireRuntime1_5_1;
WASM.prototype._wl_pipeline_get_api_object = requireRuntime1_5_1;
WASM.prototype._wl_pipeline_findByName = requireRuntime1_5_1;
var LOADING_SCREEN_PATH = "WonderlandRuntime-LoadingScreen.bin";
function loadScript(scriptURL) {
  return new Promise((resolve, reject) => {
    let s = document.createElement("script"), node = document.body.appendChild(s);
    s.onload = () => {
      document.body.removeChild(node), resolve();
    }, s.onerror = (e) => {
      document.body.removeChild(node), reject(e);
    }, s.src = scriptURL;
  });
}
async function detectFeatures() {
  let threadsSupported = await threads();
  return threadsSupported ? self.crossOriginIsolated ? console.log("WASM Threads is supported") : console.warn("WASM Threads is supported, but the page is not crossOriginIsolated, therefore thread support is disabled.") : console.warn("WASM Threads is not supported"), threadsSupported = threadsSupported && self.crossOriginIsolated, { threadsSupported };
}
var RequiredWebGPUFeatures = ["texture-compression-bc", "depth32float-stencil8"];
var OptionalWebGPUFeatures = ["timestamp-query"];
async function isWebGPUSupported() {
  let gpu = navigator.gpu;
  if (!gpu)
    return false;
  try {
    let adapter = await gpu.requestAdapter();
    if (!adapter)
      return false;
    for (let feature of RequiredWebGPUFeatures)
      if (!adapter.features.has(feature))
        return false;
    return true;
  } catch {
    return false;
  }
}
async function loadRuntime(runtime, options = {}) {
  let baseURL = getBaseUrl(runtime), { threadsSupported } = await detectFeatures(), { threads: threads2 = true, webgl2 = true, webgpu = false, physx = false, loader = false, renderer = true, xrFramebufferScaleFactor = 1, xrOfferSession = null, loadingScreen = baseURL ? `${baseURL}/${LOADING_SCREEN_PATH}` : LOADING_SCREEN_PATH, loadUncompressedImagesAsBitmap = true, canvas: canvas2 = "canvas", logs = [0, 1, 2] } = options, webgpuEnabled = webgpu && await isWebGPUSupported();
  if (webgpu && !webgpuEnabled && console.warn("WebGPU is not supported"), !webgpuEnabled && !webgl2)
    throw new Error("No suitable rendering backend found. Enabling fallback to WebGL2 is recommended.");
  let useThreads = threads2 && threadsSupported, variant = [];
  loader && variant.push("loader"), physx && variant.push("physx"), webgpuEnabled && variant.push("webgpu"), useThreads && variant.push("threads");
  let variantStr = variant.join("-"), filename = runtime;
  variantStr && (filename = `${filename}-${variantStr}`);
  let download = function(filename2, errorMessage) {
    return fetch(filename2).then((r) => r.ok ? r.arrayBuffer() : Promise.reject(errorMessage)).catch((_) => Promise.reject(errorMessage));
  }, [wasmData, loadingScreenData] = await Promise.all([download(`${filename}.wasm`, `Failed to fetch runtime .wasm file: ${filename}`), download(loadingScreen, "Failed to fetch loading screen file")]), canvasElement = document.getElementById(canvas2);
  if (!canvasElement)
    throw new Error(`loadRuntime(): Failed to find canvas with id '${canvas2}'`);
  if (!(canvasElement instanceof HTMLCanvasElement))
    throw new Error(`loadRuntime(): HTML element '${canvas2}' must be a canvas`);
  let wasm = new WASM(useThreads);
  wasm.wasm = wasmData, wasm.canvas = canvasElement, wasm._log.levels.enable(...logs), window._WL || (window._WL = { runtimes: {} });
  let runtimes = window._WL.runtimes, runtimeGlobalId = variantStr || "default";
  if (runtimes[runtimeGlobalId] || (await loadScript(`${filename}.js`), runtimes[runtimeGlobalId] = window.instantiateWonderlandRuntime, window.instantiateWonderlandRuntime = void 0), await runtimes[runtimeGlobalId](wasm), webgpuEnabled) {
    let gpu = navigator.gpu, context = null, device = null;
    try {
      let adapter = await gpu.requestAdapter(), features = [...RequiredWebGPUFeatures];
      for (let feature of OptionalWebGPUFeatures)
        adapter.features.has(feature) && features.push(feature);
      device = await adapter.requestDevice({ requiredFeatures: features }), wasm.preinitializedWebGPUDevice = device, context = canvasElement.getContext("webgpu");
    } catch {
      context = null;
    }
    if (context === null)
      return wasm._log.warn(0, "WebGPU initialization failed, falling back to WebGL2."), loadRuntime(runtime, { ...options, webgpu: false });
    context.configure({ device, format: gpu.getPreferredCanvasFormat(), alphaMode: "premultiplied" });
  }
  let engine2 = new WonderlandEngine(wasm, loadingScreenData, renderer);
  return engine2.loadUncompressedImagesAsBitmap = loadUncompressedImagesAsBitmap, await engine2.webxr.init(xrFramebufferScaleFactor, xrOfferSession), engine2.autoResizeCanvas = true, engine2.start(), engine2;
}

// node_modules/@wonderlandengine/components/dist/8thwall-camera.js
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ARCamera8thwall = class extends Component3 {
  deprecated;
};
__publicField(ARCamera8thwall, "TypeName", "8thwall-camera");
__decorate([
  property.bool(true)
], ARCamera8thwall.prototype, "deprecated", void 0);

// node_modules/@wonderlandengine/components/dist/utils/webxr.js
var tempVec = new Float32Array(3);
var tempQuat = new Float32Array(4);
function setXRRigidTransformLocal(o, transform) {
  const r = transform.orientation;
  tempQuat[0] = r.x;
  tempQuat[1] = r.y;
  tempQuat[2] = r.z;
  tempQuat[3] = r.w;
  const t = transform.position;
  tempVec[0] = t.x;
  tempVec[1] = t.y;
  tempVec[2] = t.z;
  o.resetPositionRotation();
  o.setRotationLocal(tempQuat);
  o.translateLocal(tempVec);
}

// node_modules/@wonderlandengine/components/dist/anchor.js
var __decorate2 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var tempVec3 = new Float32Array(3);
var tempQuat2 = new Float32Array(4);
var _anchors, _addAnchor, addAnchor_fn, _removeAnchor, removeAnchor_fn, _getFrame, getFrame_fn, _createAnchor, createAnchor_fn, _onAddAnchor, onAddAnchor_fn, _onRestoreAnchor, onRestoreAnchor_fn, _onCreate, onCreate_fn;
var _Anchor = class extends Component3 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _getFrame);
    __privateAdd(this, _createAnchor);
    __privateAdd(this, _onAddAnchor);
    __privateAdd(this, _onRestoreAnchor);
    __privateAdd(this, _onCreate);
    __publicField(this, "persist", false);
    /** Unique identifier to load a persistent anchor from, or empty/null if unknown */
    __publicField(this, "uuid", null);
    /** The xrAnchor, if created */
    __publicField(this, "xrAnchor", null);
    /** Emits events when the anchor is created either by being restored or newly created */
    __publicField(this, "onCreate", new Emitter());
    /** Whether the anchor is currently being tracked */
    __publicField(this, "visible", false);
    /** Emits an event when this anchor starts tracking */
    __publicField(this, "onTrackingFound", new Emitter());
    /** Emits an event when this anchor stops tracking */
    __publicField(this, "onTrackingLost", new Emitter());
    /** XRFrame to use for creating the anchor */
    __publicField(this, "xrFrame", null);
    /** XRHitTestResult to use for creating the anchor */
    __publicField(this, "xrHitResult", null);
  }
  /** Retrieve all anchors of the current scene */
  static getAllAnchors() {
    return __privateGet(_Anchor, _anchors);
  }
  /**
   * Create a new anchor
   *
   * @param o Object to attach the component to
   * @param params Parameters for the anchor component
   * @param frame XRFrame to use for anchor cration, if null, will use the current frame if available
   * @param hitResult Optional hit-test result to create the anchor with
   * @returns Promise for the newly created anchor component
   */
  static create(o, params, frame, hitResult) {
    const a = o.addComponent(_Anchor, { ...params, active: false });
    if (a === null)
      return null;
    a.xrHitResult = hitResult ?? null;
    a.xrFrame = frame ?? null;
    a.onCreate.once(() => (a.xrFrame = null, a.xrHitResult = null));
    a.active = true;
    return a.onCreate.promise();
  }
  start() {
    if (this.uuid && this.engine.xr) {
      this.persist = true;
      if (this.engine.xr.session.restorePersistentAnchor === void 0) {
        console.warn("anchor: Persistent anchors are not supported by your client. Ignoring persist property.");
      }
      this.engine.xr.session.restorePersistentAnchor(this.uuid).then(__privateMethod(this, _onRestoreAnchor, onRestoreAnchor_fn).bind(this));
    } else if (__privateMethod(this, _getFrame, getFrame_fn).call(this)) {
      __privateMethod(this, _createAnchor, createAnchor_fn).call(this).then(__privateMethod(this, _onAddAnchor, onAddAnchor_fn).bind(this));
    } else {
      throw new Error("Anchors can only be created during the XR frame in an active XR session");
    }
  }
  update() {
    if (!this.xrAnchor || !this.engine.xr)
      return;
    const pose = this.engine.xr.frame.getPose(this.xrAnchor.anchorSpace, this.engine.xr.currentReferenceSpace);
    const visible = !!pose;
    if (visible != this.visible) {
      this.visible = visible;
      (visible ? this.onTrackingFound : this.onTrackingLost).notify(this);
    }
    if (pose) {
      setXRRigidTransformLocal(this.object, pose.transform);
    }
  }
  onDestroy() {
    var _a12;
    __privateMethod(_a12 = _Anchor, _removeAnchor, removeAnchor_fn).call(_a12, this);
  }
};
var Anchor = _Anchor;
_anchors = new WeakMap();
_addAnchor = new WeakSet();
addAnchor_fn = function(anchor) {
  __privateGet(_Anchor, _anchors).push(anchor);
};
_removeAnchor = new WeakSet();
removeAnchor_fn = function(anchor) {
  const index = __privateGet(_Anchor, _anchors).indexOf(anchor);
  if (index < 0)
    return;
  __privateGet(_Anchor, _anchors).splice(index, 1);
};
_getFrame = new WeakSet();
getFrame_fn = function() {
  return this.xrFrame || this.engine.xr.frame;
};
_createAnchor = new WeakSet();
createAnchor_fn = async function() {
  if (!__privateMethod(this, _getFrame, getFrame_fn).call(this).createAnchor) {
    throw new Error("Cannot create anchor - anchors not supported, did you enable the 'anchors' WebXR feature?");
  }
  if (this.xrHitResult) {
    if (this.xrHitResult.createAnchor === void 0) {
      throw new Error("Requested anchor on XRHitTestResult, but WebXR hit-test feature is not available.");
    }
    return this.xrHitResult.createAnchor();
  } else {
    this.object.getTranslationWorld(tempVec3);
    tempQuat2.set(this.object.rotationWorld);
    const rotation = tempQuat2;
    const anchorPose = new XRRigidTransform({ x: tempVec3[0], y: tempVec3[1], z: tempVec3[2] }, { x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3] });
    return __privateMethod(this, _getFrame, getFrame_fn).call(this)?.createAnchor(anchorPose, this.engine.xr.currentReferenceSpace);
  }
};
_onAddAnchor = new WeakSet();
onAddAnchor_fn = function(anchor) {
  if (!anchor)
    return;
  if (this.persist) {
    if (anchor.requestPersistentHandle !== void 0) {
      anchor.requestPersistentHandle().then((uuid) => {
        var _a12;
        this.uuid = uuid;
        __privateMethod(this, _onCreate, onCreate_fn).call(this, anchor);
        __privateMethod(_a12 = _Anchor, _addAnchor, addAnchor_fn).call(_a12, this);
      });
      return;
    } else {
      console.warn("anchor: Persistent anchors are not supported by your client. Ignoring persist property.");
    }
  }
  __privateMethod(this, _onCreate, onCreate_fn).call(this, anchor);
};
_onRestoreAnchor = new WeakSet();
onRestoreAnchor_fn = function(anchor) {
  __privateMethod(this, _onCreate, onCreate_fn).call(this, anchor);
};
_onCreate = new WeakSet();
onCreate_fn = function(anchor) {
  this.xrAnchor = anchor;
  this.onCreate.notify(this);
};
__privateAdd(Anchor, _addAnchor);
__privateAdd(Anchor, _removeAnchor);
__publicField(Anchor, "TypeName", "anchor");
/* Static management of all anchors */
__privateAdd(Anchor, _anchors, []);
__decorate2([
  property.bool(false)
], Anchor.prototype, "persist", void 0);
__decorate2([
  property.string()
], Anchor.prototype, "uuid", void 0);

// node_modules/@wonderlandengine/components/dist/cursor-target.js
var CursorTarget = class extends Component3 {
  /** Emitter for events when the target is hovered */
  onHover = new Emitter();
  /** Emitter for events when the target is unhovered */
  onUnhover = new Emitter();
  /** Emitter for events when the target is clicked */
  onClick = new Emitter();
  /** Emitter for events when the cursor moves on the target */
  onMove = new Emitter();
  /** Emitter for events when the user pressed the select button on the target */
  onDown = new Emitter();
  /** Emitter for events when the user unpressed the select button on the target */
  onUp = new Emitter();
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onHover.add(f);
   */
  addHoverFunction(f) {
    this.onHover.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onHover.remove(f);
   */
  removeHoverFunction(f) {
    this.onHover.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onUnhover.add(f);
   */
  addUnHoverFunction(f) {
    this.onUnhover.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onUnhover.remove(f);
   */
  removeUnHoverFunction(f) {
    this.onUnhover.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onClick.add(f);
   */
  addClickFunction(f) {
    this.onClick.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onClick.remove(f);
   */
  removeClickFunction(f) {
    this.onClick.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onMove.add(f);
   */
  addMoveFunction(f) {
    this.onMove.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onMove.remove(f);
   */
  removeMoveFunction(f) {
    this.onMove.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onDown.add(f);
   */
  addDownFunction(f) {
    this.onDown.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onDown.remove(f);
   */
  removeDownFunction(f) {
    this.onDown.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onUp.add(f);
   */
  addUpFunction(f) {
    this.onUp.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onUp.remove(f);
   */
  removeUpFunction(f) {
    this.onUp.remove(f);
  }
};
__publicField(CursorTarget, "TypeName", "cursor-target");
__publicField(CursorTarget, "Properties", {});

// node_modules/gl-matrix/esm/common.js
var EPSILON = 1e-6;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
var ANGLE_ORDER = "zyx";
function round(a) {
  if (a >= 0)
    return Math.round(a);
  return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
}
var degree = Math.PI / 180;
var radian = 180 / Math.PI;

// node_modules/gl-matrix/esm/mat3.js
function create() {
  var out = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

// node_modules/gl-matrix/esm/mat4.js
var mat4_exports = {};
__export(mat4_exports, {
  add: () => add,
  adjoint: () => adjoint,
  clone: () => clone,
  copy: () => copy,
  create: () => create2,
  decompose: () => decompose,
  determinant: () => determinant,
  equals: () => equals,
  exactEquals: () => exactEquals,
  frob: () => frob,
  fromQuat: () => fromQuat,
  fromQuat2: () => fromQuat2,
  fromRotation: () => fromRotation,
  fromRotationTranslation: () => fromRotationTranslation,
  fromRotationTranslationScale: () => fromRotationTranslationScale,
  fromRotationTranslationScaleOrigin: () => fromRotationTranslationScaleOrigin,
  fromScaling: () => fromScaling,
  fromTranslation: () => fromTranslation,
  fromValues: () => fromValues,
  fromXRotation: () => fromXRotation,
  fromYRotation: () => fromYRotation,
  fromZRotation: () => fromZRotation,
  frustum: () => frustum,
  getRotation: () => getRotation,
  getScaling: () => getScaling,
  getTranslation: () => getTranslation,
  identity: () => identity,
  invert: () => invert,
  lookAt: () => lookAt,
  mul: () => mul,
  multiply: () => multiply,
  multiplyScalar: () => multiplyScalar,
  multiplyScalarAndAdd: () => multiplyScalarAndAdd,
  ortho: () => ortho,
  orthoNO: () => orthoNO,
  orthoZO: () => orthoZO,
  perspective: () => perspective,
  perspectiveFromFieldOfView: () => perspectiveFromFieldOfView,
  perspectiveNO: () => perspectiveNO,
  perspectiveZO: () => perspectiveZO,
  rotate: () => rotate,
  rotateX: () => rotateX,
  rotateY: () => rotateY,
  rotateZ: () => rotateZ,
  scale: () => scale,
  set: () => set,
  str: () => str,
  sub: () => sub,
  subtract: () => subtract,
  targetTo: () => targetTo,
  translate: () => translate,
  transpose: () => transpose
});
function create2() {
  var out = new ARRAY_TYPE(16);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
function clone(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function transpose(out, a) {
  if (out === a) {
    var a01 = a[1], a02 = a[2], a03 = a[3];
    var a12 = a[6], a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}
function invert(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
function adjoint(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  out[0] = a11 * b11 - a12 * b10 + a13 * b09;
  out[1] = a02 * b10 - a01 * b11 - a03 * b09;
  out[2] = a31 * b05 - a32 * b04 + a33 * b03;
  out[3] = a22 * b04 - a21 * b05 - a23 * b03;
  out[4] = a12 * b08 - a10 * b11 - a13 * b07;
  out[5] = a00 * b11 - a02 * b08 + a03 * b07;
  out[6] = a32 * b02 - a30 * b05 - a33 * b01;
  out[7] = a20 * b05 - a22 * b02 + a23 * b01;
  out[8] = a10 * b10 - a11 * b08 + a13 * b06;
  out[9] = a01 * b08 - a00 * b10 - a03 * b06;
  out[10] = a30 * b04 - a31 * b02 + a33 * b00;
  out[11] = a21 * b02 - a20 * b04 - a23 * b00;
  out[12] = a11 * b07 - a10 * b09 - a12 * b06;
  out[13] = a00 * b09 - a01 * b07 + a02 * b06;
  out[14] = a31 * b01 - a30 * b03 - a32 * b00;
  out[15] = a20 * b03 - a21 * b01 + a22 * b00;
  return out;
}
function determinant(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = a00 * a11 - a01 * a10;
  var b1 = a00 * a12 - a02 * a10;
  var b2 = a01 * a12 - a02 * a11;
  var b3 = a20 * a31 - a21 * a30;
  var b4 = a20 * a32 - a22 * a30;
  var b5 = a21 * a32 - a22 * a31;
  var b6 = a00 * b5 - a01 * b4 + a02 * b3;
  var b7 = a10 * b5 - a11 * b4 + a12 * b3;
  var b8 = a20 * b2 - a21 * b1 + a22 * b0;
  var b9 = a30 * b2 - a31 * b1 + a32 * b0;
  return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
}
function multiply(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
function translate(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
function scale(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function rotate(out, a, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len4 = Math.sqrt(x * x + y * y + z * z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len4 < EPSILON) {
    return null;
  }
  len4 = 1 / len4;
  x *= len4;
  y *= len4;
  z *= len4;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  if (a !== out) {
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotation(out, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len4 = Math.sqrt(x * x + y * y + z * z);
  var s, c, t;
  if (len4 < EPSILON) {
    return null;
  }
  len4 = 1 / len4;
  x *= len4;
  y *= len4;
  z *= len4;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotationTranslation(out, q, v) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation(out, a, translation);
  return out;
}
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  return out;
}
function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
function decompose(out_r, out_t, out_s, mat) {
  out_t[0] = mat[12];
  out_t[1] = mat[13];
  out_t[2] = mat[14];
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out_s[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out_s[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out_s[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  var is1 = 1 / out_s[0];
  var is2 = 1 / out_s[1];
  var is3 = 1 / out_s[2];
  var sm11 = m11 * is1;
  var sm12 = m12 * is2;
  var sm13 = m13 * is3;
  var sm21 = m21 * is1;
  var sm22 = m22 * is2;
  var sm23 = m23 * is3;
  var sm31 = m31 * is1;
  var sm32 = m32 * is2;
  var sm33 = m33 * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out_r[3] = 0.25 * S;
    out_r[0] = (sm23 - sm32) / S;
    out_r[1] = (sm31 - sm13) / S;
    out_r[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out_r[3] = (sm23 - sm32) / S;
    out_r[0] = 0.25 * S;
    out_r[1] = (sm12 + sm21) / S;
    out_r[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out_r[3] = (sm31 - sm13) / S;
    out_r[0] = (sm12 + sm21) / S;
    out_r[1] = 0.25 * S;
    out_r[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out_r[3] = (sm12 - sm21) / S;
    out_r[0] = (sm31 + sm13) / S;
    out_r[1] = (sm23 + sm32) / S;
    out_r[2] = 0.25 * S;
  }
  return out_r;
}
function fromRotationTranslationScale(out, q, v, s) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
function fromQuat(out, q) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    var nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}
var perspective = perspectiveNO;
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    var nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }
  return out;
}
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
  var xScale = 2 / (leftTan + rightTan);
  var yScale = 2 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = yScale;
  out[6] = 0;
  out[7] = 0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near / (near - far);
  out[15] = 0;
  return out;
}
function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
var ortho = orthoNO;
function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len4;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];
  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity(out);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len4 = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len4;
  z1 *= len4;
  z2 *= len4;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len4 = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len4) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len4 = 1 / len4;
    x0 *= len4;
    x1 *= len4;
    x2 *= len4;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len4 = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len4) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len4 = 1 / len4;
    y0 *= len4;
    y1 *= len4;
    y2 *= len4;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
function targetTo(out, eye, target, up) {
  var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  var len4 = z0 * z0 + z1 * z1 + z2 * z2;
  if (len4 > 0) {
    len4 = 1 / Math.sqrt(len4);
    z0 *= len4;
    z1 *= len4;
    z2 *= len4;
  }
  var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len4 = x0 * x0 + x1 * x1 + x2 * x2;
  if (len4 > 0) {
    len4 = 1 / Math.sqrt(len4);
    x0 *= len4;
    x1 *= len4;
    x2 *= len4;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
function str(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
function frob(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3] + a[4] * a[4] + a[5] * a[5] + a[6] * a[6] + a[7] * a[7] + a[8] * a[8] + a[9] * a[9] + a[10] * a[10] + a[11] * a[11] + a[12] * a[12] + a[13] * a[13] + a[14] * a[14] + a[15] * a[15]);
}
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
function multiplyScalarAndAdd(out, a, b, scale6) {
  out[0] = a[0] + b[0] * scale6;
  out[1] = a[1] + b[1] * scale6;
  out[2] = a[2] + b[2] * scale6;
  out[3] = a[3] + b[3] * scale6;
  out[4] = a[4] + b[4] * scale6;
  out[5] = a[5] + b[5] * scale6;
  out[6] = a[6] + b[6] * scale6;
  out[7] = a[7] + b[7] * scale6;
  out[8] = a[8] + b[8] * scale6;
  out[9] = a[9] + b[9] * scale6;
  out[10] = a[10] + b[10] * scale6;
  out[11] = a[11] + b[11] * scale6;
  out[12] = a[12] + b[12] * scale6;
  out[13] = a[13] + b[13] * scale6;
  out[14] = a[14] + b[14] * scale6;
  out[15] = a[15] + b[15] * scale6;
  return out;
}
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
function equals(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
  var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
  var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15));
}
var mul = multiply;
var sub = subtract;

// node_modules/gl-matrix/esm/quat.js
var quat_exports = {};
__export(quat_exports, {
  add: () => add4,
  calculateW: () => calculateW,
  clone: () => clone4,
  conjugate: () => conjugate,
  copy: () => copy4,
  create: () => create5,
  dot: () => dot3,
  equals: () => equals3,
  exactEquals: () => exactEquals4,
  exp: () => exp,
  fromEuler: () => fromEuler,
  fromMat3: () => fromMat3,
  fromValues: () => fromValues4,
  getAngle: () => getAngle,
  getAxisAngle: () => getAxisAngle,
  identity: () => identity2,
  invert: () => invert2,
  len: () => len2,
  length: () => length3,
  lerp: () => lerp3,
  ln: () => ln,
  mul: () => mul3,
  multiply: () => multiply3,
  normalize: () => normalize3,
  pow: () => pow,
  random: () => random2,
  rotateX: () => rotateX3,
  rotateY: () => rotateY3,
  rotateZ: () => rotateZ3,
  rotationTo: () => rotationTo,
  scale: () => scale4,
  set: () => set4,
  setAxes: () => setAxes,
  setAxisAngle: () => setAxisAngle,
  slerp: () => slerp2,
  sqlerp: () => sqlerp,
  sqrLen: () => sqrLen2,
  squaredLength: () => squaredLength3,
  str: () => str3
});

// node_modules/gl-matrix/esm/vec3.js
var vec3_exports = {};
__export(vec3_exports, {
  add: () => add2,
  angle: () => angle,
  bezier: () => bezier,
  ceil: () => ceil,
  clone: () => clone2,
  copy: () => copy2,
  create: () => create3,
  cross: () => cross,
  dist: () => dist,
  distance: () => distance,
  div: () => div,
  divide: () => divide,
  dot: () => dot,
  equals: () => equals2,
  exactEquals: () => exactEquals2,
  floor: () => floor,
  forEach: () => forEach,
  fromValues: () => fromValues2,
  hermite: () => hermite,
  inverse: () => inverse,
  len: () => len,
  length: () => length,
  lerp: () => lerp,
  max: () => max,
  min: () => min,
  mul: () => mul2,
  multiply: () => multiply2,
  negate: () => negate,
  normalize: () => normalize,
  random: () => random,
  rotateX: () => rotateX2,
  rotateY: () => rotateY2,
  rotateZ: () => rotateZ2,
  round: () => round2,
  scale: () => scale2,
  scaleAndAdd: () => scaleAndAdd,
  set: () => set2,
  slerp: () => slerp,
  sqrDist: () => sqrDist,
  sqrLen: () => sqrLen,
  squaredDistance: () => squaredDistance,
  squaredLength: () => squaredLength,
  str: () => str2,
  sub: () => sub2,
  subtract: () => subtract2,
  transformMat3: () => transformMat3,
  transformMat4: () => transformMat4,
  transformQuat: () => transformQuat,
  zero: () => zero
});
function create3() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
function clone2(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function fromValues2(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function copy2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function set2(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function add2(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
function subtract2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
function multiply2(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
function round2(out, a) {
  out[0] = round(a[0]);
  out[1] = round(a[1]);
  out[2] = round(a[2]);
  return out;
}
function scale2(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
function scaleAndAdd(out, a, b, scale6) {
  out[0] = a[0] + b[0] * scale6;
  out[1] = a[1] + b[1] * scale6;
  out[2] = a[2] + b[2] * scale6;
  return out;
}
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
function inverse(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len4 = x * x + y * y + z * z;
  if (len4 > 0) {
    len4 = 1 / Math.sqrt(len4);
  }
  out[0] = a[0] * len4;
  out[1] = a[1] * len4;
  out[2] = a[2] * len4;
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2];
  var bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
function slerp(out, a, b, t) {
  var angle2 = Math.acos(Math.min(Math.max(dot(a, b), -1), 1));
  var sinTotal = Math.sin(angle2);
  var ratioA = Math.sin((1 - t) * angle2) / sinTotal;
  var ratioB = Math.sin(t * angle2) / sinTotal;
  out[0] = ratioA * a[0] + ratioB * b[0];
  out[1] = ratioA * a[1] + ratioB * b[1];
  out[2] = ratioA * a[2] + ratioB * b[2];
  return out;
}
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function random(out, scale6) {
  scale6 = scale6 === void 0 ? 1 : scale6;
  var r = RANDOM() * 2 * Math.PI;
  var z = RANDOM() * 2 - 1;
  var zScale = Math.sqrt(1 - z * z) * scale6;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale6;
  return out;
}
function transformMat4(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
function transformMat3(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
function transformQuat(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  var vx = a[0], vy = a[1], vz = a[2];
  var tx = qy * vz - qz * vy;
  var ty = qz * vx - qx * vz;
  var tz = qx * vy - qy * vx;
  tx = tx + tx;
  ty = ty + ty;
  tz = tz + tz;
  out[0] = vx + qw * tx + qy * tz - qz * ty;
  out[1] = vy + qw * ty + qz * tx - qx * tz;
  out[2] = vz + qw * tz + qx * ty - qy * tx;
  return out;
}
function rotateX2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateY2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateZ2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function angle(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2], mag = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz)), cosine = mag && dot(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
}
function str2(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
function exactEquals2(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function equals2(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2];
  var b0 = b[0], b1 = b[1], b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2));
}
var sub2 = subtract2;
var mul2 = multiply2;
var div = divide;
var dist = distance;
var sqrDist = squaredDistance;
var len = length;
var sqrLen = squaredLength;
var forEach = function() {
  var vec = create3();
  return function(a, stride, offset2, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset2) {
      offset2 = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset2, a.length);
    } else {
      l = a.length;
    }
    for (i = offset2; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
}();

// node_modules/gl-matrix/esm/vec4.js
function create4() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}
function clone3(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function fromValues3(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function copy3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function set3(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function add3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
function scale3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
function length2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}
function squaredLength2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
function normalize2(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len4 = x * x + y * y + z * z + w * w;
  if (len4 > 0) {
    len4 = 1 / Math.sqrt(len4);
  }
  out[0] = x * len4;
  out[1] = y * len4;
  out[2] = z * len4;
  out[3] = w * len4;
  return out;
}
function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
function lerp2(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
function exactEquals3(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
var forEach2 = function() {
  var vec = create4();
  return function(a, stride, offset2, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 4;
    }
    if (!offset2) {
      offset2 = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset2, a.length);
    } else {
      l = a.length;
    }
    for (i = offset2; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }
    return a;
  };
}();

// node_modules/gl-matrix/esm/quat.js
function create5() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}
function identity2(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2;
  var s = Math.sin(rad / 2);
  if (s > EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }
  return rad;
}
function getAngle(a, b) {
  var dotproduct = dot3(a, b);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}
function multiply3(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function rotateX3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
function rotateY3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var by = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
function rotateZ3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bz = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
function calculateW(out, a) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
  return out;
}
function exp(out, a) {
  var x = a[0], y = a[1], z = a[2], w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}
function ln(out, a) {
  var x = a[0], y = a[1], z = a[2], w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}
function pow(out, a, b) {
  ln(out, a);
  scale4(out, out, b);
  exp(out, out);
  return out;
}
function slerp2(out, a, b, t) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  var omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > EPSILON) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
function random2(out) {
  var u1 = RANDOM();
  var u2 = RANDOM();
  var u3 = RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2 * Math.PI * u3);
  return out;
}
function invert2(out, a) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var dot5 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot5 ? 1 / dot5 : 0;
  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
function fromMat3(out, m) {
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    var i = 0;
    if (m[4] > m[0])
      i = 1;
    if (m[8] > m[i * 3 + i])
      i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
function fromEuler(out, x, y, z) {
  var order = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : ANGLE_ORDER;
  var halfToRad = Math.PI / 360;
  x *= halfToRad;
  z *= halfToRad;
  y *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  switch (order) {
    case "xyz":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "xzy":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    case "yxz":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    case "yzx":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "zxy":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "zyx":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    default:
      throw new Error("Unknown angle order " + order);
  }
  return out;
}
function str3(a) {
  return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
var clone4 = clone3;
var fromValues4 = fromValues3;
var copy4 = copy3;
var set4 = set3;
var add4 = add3;
var mul3 = multiply3;
var scale4 = scale3;
var dot3 = dot2;
var lerp3 = lerp2;
var length3 = length2;
var len2 = length3;
var squaredLength3 = squaredLength2;
var sqrLen2 = squaredLength3;
var normalize3 = normalize2;
var exactEquals4 = exactEquals3;
function equals3(a, b) {
  return Math.abs(dot2(a, b)) >= 1 - EPSILON;
}
var rotationTo = function() {
  var tmpvec3 = create3();
  var xUnitVec3 = fromValues2(1, 0, 0);
  var yUnitVec3 = fromValues2(0, 1, 0);
  return function(out, a, b) {
    var dot5 = dot(a, b);
    if (dot5 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 1e-6)
        cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot5 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot5;
      return normalize3(out, out);
    }
  };
}();
var sqlerp = function() {
  var temp1 = create5();
  var temp2 = create5();
  return function(out, a, b, c, d, t) {
    slerp2(temp1, a, d, t);
    slerp2(temp2, b, c, t);
    slerp2(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
var setAxes = function() {
  var matr = create();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize3(out, fromMat3(out, matr));
  };
}();

// node_modules/gl-matrix/esm/quat2.js
var quat2_exports = {};
__export(quat2_exports, {
  add: () => add5,
  clone: () => clone5,
  conjugate: () => conjugate2,
  copy: () => copy5,
  create: () => create6,
  dot: () => dot4,
  equals: () => equals4,
  exactEquals: () => exactEquals5,
  fromMat4: () => fromMat4,
  fromRotation: () => fromRotation2,
  fromRotationTranslation: () => fromRotationTranslation2,
  fromRotationTranslationValues: () => fromRotationTranslationValues,
  fromTranslation: () => fromTranslation2,
  fromValues: () => fromValues5,
  getDual: () => getDual,
  getReal: () => getReal,
  getTranslation: () => getTranslation2,
  identity: () => identity3,
  invert: () => invert3,
  len: () => len3,
  length: () => length4,
  lerp: () => lerp4,
  mul: () => mul4,
  multiply: () => multiply4,
  normalize: () => normalize4,
  rotateAroundAxis: () => rotateAroundAxis,
  rotateByQuatAppend: () => rotateByQuatAppend,
  rotateByQuatPrepend: () => rotateByQuatPrepend,
  rotateX: () => rotateX4,
  rotateY: () => rotateY4,
  rotateZ: () => rotateZ4,
  scale: () => scale5,
  set: () => set5,
  setDual: () => setDual,
  setReal: () => setReal,
  sqrLen: () => sqrLen3,
  squaredLength: () => squaredLength4,
  str: () => str4,
  translate: () => translate2
});
function create6() {
  var dq = new ARRAY_TYPE(8);
  if (ARRAY_TYPE != Float32Array) {
    dq[0] = 0;
    dq[1] = 0;
    dq[2] = 0;
    dq[4] = 0;
    dq[5] = 0;
    dq[6] = 0;
    dq[7] = 0;
  }
  dq[3] = 1;
  return dq;
}
function clone5(a) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = a[0];
  dq[1] = a[1];
  dq[2] = a[2];
  dq[3] = a[3];
  dq[4] = a[4];
  dq[5] = a[5];
  dq[6] = a[6];
  dq[7] = a[7];
  return dq;
}
function fromValues5(x1, y1, z1, w1, x2, y2, z2, w2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  dq[4] = x2;
  dq[5] = y2;
  dq[6] = z2;
  dq[7] = w2;
  return dq;
}
function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  var ax = x2 * 0.5, ay = y2 * 0.5, az = z2 * 0.5;
  dq[4] = ax * w1 + ay * z1 - az * y1;
  dq[5] = ay * w1 + az * x1 - ax * z1;
  dq[6] = az * w1 + ax * y1 - ay * x1;
  dq[7] = -ax * x1 - ay * y1 - az * z1;
  return dq;
}
function fromRotationTranslation2(out, q, t) {
  var ax = t[0] * 0.5, ay = t[1] * 0.5, az = t[2] * 0.5, bx = q[0], by = q[1], bz = q[2], bw = q[3];
  out[0] = bx;
  out[1] = by;
  out[2] = bz;
  out[3] = bw;
  out[4] = ax * bw + ay * bz - az * by;
  out[5] = ay * bw + az * bx - ax * bz;
  out[6] = az * bw + ax * by - ay * bx;
  out[7] = -ax * bx - ay * by - az * bz;
  return out;
}
function fromTranslation2(out, t) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = t[0] * 0.5;
  out[5] = t[1] * 0.5;
  out[6] = t[2] * 0.5;
  out[7] = 0;
  return out;
}
function fromRotation2(out, q) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
function fromMat4(out, a) {
  var outer = create5();
  getRotation(outer, a);
  var t = new ARRAY_TYPE(3);
  getTranslation(t, a);
  fromRotationTranslation2(out, outer, t);
  return out;
}
function copy5(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  return out;
}
function identity3(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
function set5(out, x1, y1, z1, w1, x2, y2, z2, w2) {
  out[0] = x1;
  out[1] = y1;
  out[2] = z1;
  out[3] = w1;
  out[4] = x2;
  out[5] = y2;
  out[6] = z2;
  out[7] = w2;
  return out;
}
var getReal = copy4;
function getDual(out, a) {
  out[0] = a[4];
  out[1] = a[5];
  out[2] = a[6];
  out[3] = a[7];
  return out;
}
var setReal = copy4;
function setDual(out, q) {
  out[4] = q[0];
  out[5] = q[1];
  out[6] = q[2];
  out[7] = q[3];
  return out;
}
function getTranslation2(out, a) {
  var ax = a[4], ay = a[5], az = a[6], aw = a[7], bx = -a[0], by = -a[1], bz = -a[2], bw = a[3];
  out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
  out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
  out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  return out;
}
function translate2(out, a, v) {
  var ax1 = a[0], ay1 = a[1], az1 = a[2], aw1 = a[3], bx1 = v[0] * 0.5, by1 = v[1] * 0.5, bz1 = v[2] * 0.5, ax2 = a[4], ay2 = a[5], az2 = a[6], aw2 = a[7];
  out[0] = ax1;
  out[1] = ay1;
  out[2] = az1;
  out[3] = aw1;
  out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
  out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
  out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
  out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
  return out;
}
function rotateX4(out, a, rad) {
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateX3(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
function rotateY4(out, a, rad) {
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateY3(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
function rotateZ4(out, a, rad) {
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateZ3(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
function rotateByQuatAppend(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3], ax = a[0], ay = a[1], az = a[2], aw = a[3];
  out[0] = ax * qw + aw * qx + ay * qz - az * qy;
  out[1] = ay * qw + aw * qy + az * qx - ax * qz;
  out[2] = az * qw + aw * qz + ax * qy - ay * qx;
  out[3] = aw * qw - ax * qx - ay * qy - az * qz;
  ax = a[4];
  ay = a[5];
  az = a[6];
  aw = a[7];
  out[4] = ax * qw + aw * qx + ay * qz - az * qy;
  out[5] = ay * qw + aw * qy + az * qx - ax * qz;
  out[6] = az * qw + aw * qz + ax * qy - ay * qx;
  out[7] = aw * qw - ax * qx - ay * qy - az * qz;
  return out;
}
function rotateByQuatPrepend(out, q, a) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3], bx = a[0], by = a[1], bz = a[2], bw = a[3];
  out[0] = qx * bw + qw * bx + qy * bz - qz * by;
  out[1] = qy * bw + qw * by + qz * bx - qx * bz;
  out[2] = qz * bw + qw * bz + qx * by - qy * bx;
  out[3] = qw * bw - qx * bx - qy * by - qz * bz;
  bx = a[4];
  by = a[5];
  bz = a[6];
  bw = a[7];
  out[4] = qx * bw + qw * bx + qy * bz - qz * by;
  out[5] = qy * bw + qw * by + qz * bx - qx * bz;
  out[6] = qz * bw + qw * bz + qx * by - qy * bx;
  out[7] = qw * bw - qx * bx - qy * by - qz * bz;
  return out;
}
function rotateAroundAxis(out, a, axis, rad) {
  if (Math.abs(rad) < EPSILON) {
    return copy5(out, a);
  }
  var axisLength = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
  rad = rad * 0.5;
  var s = Math.sin(rad);
  var bx = s * axis[0] / axisLength;
  var by = s * axis[1] / axisLength;
  var bz = s * axis[2] / axisLength;
  var bw = Math.cos(rad);
  var ax1 = a[0], ay1 = a[1], az1 = a[2], aw1 = a[3];
  out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  var ax = a[4], ay = a[5], az = a[6], aw = a[7];
  out[4] = ax * bw + aw * bx + ay * bz - az * by;
  out[5] = ay * bw + aw * by + az * bx - ax * bz;
  out[6] = az * bw + aw * bz + ax * by - ay * bx;
  out[7] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function add5(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  return out;
}
function multiply4(out, a, b) {
  var ax0 = a[0], ay0 = a[1], az0 = a[2], aw0 = a[3], bx1 = b[4], by1 = b[5], bz1 = b[6], bw1 = b[7], ax1 = a[4], ay1 = a[5], az1 = a[6], aw1 = a[7], bx0 = b[0], by0 = b[1], bz0 = b[2], bw0 = b[3];
  out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
  out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
  out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
  out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
  out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
  out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
  out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
  out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
  return out;
}
var mul4 = multiply4;
function scale5(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  return out;
}
var dot4 = dot3;
function lerp4(out, a, b, t) {
  var mt = 1 - t;
  if (dot4(a, b) < 0)
    t = -t;
  out[0] = a[0] * mt + b[0] * t;
  out[1] = a[1] * mt + b[1] * t;
  out[2] = a[2] * mt + b[2] * t;
  out[3] = a[3] * mt + b[3] * t;
  out[4] = a[4] * mt + b[4] * t;
  out[5] = a[5] * mt + b[5] * t;
  out[6] = a[6] * mt + b[6] * t;
  out[7] = a[7] * mt + b[7] * t;
  return out;
}
function invert3(out, a) {
  var sqlen = squaredLength4(a);
  out[0] = -a[0] / sqlen;
  out[1] = -a[1] / sqlen;
  out[2] = -a[2] / sqlen;
  out[3] = a[3] / sqlen;
  out[4] = -a[4] / sqlen;
  out[5] = -a[5] / sqlen;
  out[6] = -a[6] / sqlen;
  out[7] = a[7] / sqlen;
  return out;
}
function conjugate2(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  out[4] = -a[4];
  out[5] = -a[5];
  out[6] = -a[6];
  out[7] = a[7];
  return out;
}
var length4 = length3;
var len3 = length4;
var squaredLength4 = squaredLength3;
var sqrLen3 = squaredLength4;
function normalize4(out, a) {
  var magnitude = squaredLength4(a);
  if (magnitude > 0) {
    magnitude = Math.sqrt(magnitude);
    var a0 = a[0] / magnitude;
    var a1 = a[1] / magnitude;
    var a2 = a[2] / magnitude;
    var a3 = a[3] / magnitude;
    var b0 = a[4];
    var b1 = a[5];
    var b2 = a[6];
    var b3 = a[7];
    var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = (b0 - a0 * a_dot_b) / magnitude;
    out[5] = (b1 - a1 * a_dot_b) / magnitude;
    out[6] = (b2 - a2 * a_dot_b) / magnitude;
    out[7] = (b3 - a3 * a_dot_b) / magnitude;
  }
  return out;
}
function str4(a) {
  return "quat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ")";
}
function exactEquals5(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7];
}
function equals4(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7));
}

// node_modules/@wonderlandengine/components/dist/hit-test-location.js
var __decorate3 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HitTestLocation = class extends Component3 {
  tempScaling = new Float32Array(3);
  visible = false;
  xrHitTestSource = null;
  /** Reference space for creating the hit test when the session starts */
  xrReferenceSpace = null;
  /**
   * For maintaining backwards compatibility: Whether to scale the object to 0 and back.
   * @deprecated Use onHitLost and onHitFound instead.
   */
  scaleObject = true;
  /** Emits an event when the hit test switches from visible to invisible */
  onHitLost = new Emitter();
  /** Emits an event when the hit test switches from invisible to visible */
  onHitFound = new Emitter();
  onSessionStartCallback = null;
  onSessionEndCallback = null;
  start() {
    this.onSessionStartCallback = this.onXRSessionStart.bind(this);
    this.onSessionEndCallback = this.onXRSessionEnd.bind(this);
    if (this.scaleObject) {
      this.tempScaling.set(this.object.scalingLocal);
      this.object.scale([0, 0, 0]);
      this.onHitLost.add(() => {
        this.tempScaling.set(this.object.scalingLocal);
        this.object.scale([0, 0, 0]);
      });
      this.onHitFound.add(() => {
        this.object.scalingLocal.set(this.tempScaling);
        this.object.setDirty();
      });
    }
  }
  onActivate() {
    this.engine.onXRSessionStart.add(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.add(this.onSessionEndCallback);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.remove(this.onSessionEndCallback);
  }
  update() {
    const wasVisible = this.visible;
    if (this.xrHitTestSource) {
      const frame = this.engine.xrFrame;
      if (!frame)
        return;
      let hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
      if (hitTestResults.length > 0) {
        let pose = hitTestResults[0].getPose(this.engine.xr.currentReferenceSpace);
        this.visible = !!pose;
        if (pose) {
          setXRRigidTransformLocal(this.object, pose.transform);
        }
      } else {
        this.visible = false;
      }
    }
    if (this.visible != wasVisible) {
      (this.visible ? this.onHitFound : this.onHitLost).notify(this);
    }
  }
  getHitTestResults(frame = this.engine.xr?.frame ?? null) {
    if (!frame)
      return [];
    if (!this.xrHitTestSource)
      return [];
    return frame.getHitTestResults(this.xrHitTestSource);
  }
  onXRSessionStart(session) {
    if (session.requestHitTestSource === void 0) {
      console.error("hit-test-location: hit test feature not available. Deactivating component.");
      this.active = false;
      return;
    }
    session.requestHitTestSource({
      space: this.xrReferenceSpace ?? this.engine.xr.referenceSpaceForType("viewer")
    }).then((hitTestSource) => {
      this.xrHitTestSource = hitTestSource;
    }).catch(console.error);
  }
  onXRSessionEnd() {
    if (!this.xrHitTestSource)
      return;
    this.xrHitTestSource.cancel();
    this.xrHitTestSource = null;
  }
};
__publicField(HitTestLocation, "TypeName", "hit-test-location");
__decorate3([
  property.bool(true)
], HitTestLocation.prototype, "scaleObject", void 0);

// node_modules/@wonderlandengine/components/dist/cursor.js
var __decorate4 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var tempVec2 = new Float32Array(3);
var ZERO = [0, 0, 0];
var CursorTargetEmitters = class {
  /** Emitter for events when the target is hovered */
  onHover = new Emitter();
  /** Emitter for events when the target is unhovered */
  onUnhover = new Emitter();
  /** Emitter for events when the target is clicked */
  onClick = new Emitter();
  /** Emitter for events when the cursor moves on the target */
  onMove = new Emitter();
  /** Emitter for events when the user pressed the select button on the target */
  onDown = new Emitter();
  /** Emitter for events when the user unpressed the select button on the target */
  onUp = new Emitter();
};
var Cursor = class extends Component3 {
  static onRegister(engine2) {
    engine2.registerComponent(HitTestLocation);
  }
  _collisionMask = 0;
  _onDeactivateCallbacks = [];
  _input = null;
  _origin = new Float32Array(3);
  _cursorObjScale = new Float32Array(3);
  _direction = new Float32Array(3);
  _projectionMatrix = new Float32Array(16);
  _viewComponent = null;
  _isDown = false;
  _lastIsDown = false;
  _arTouchDown = false;
  _lastPointerPos = new Float32Array(2);
  _lastCursorPosOnTarget = new Float32Array(3);
  _hitTestLocation = null;
  _hitTestObject = null;
  _onSessionStartCallback = null;
  /**
   * Whether the cursor (and cursorObject) is visible, i.e. pointing at an object
   * that matches the collision group
   */
  visible = true;
  /** Currently hovered object */
  hoveringObject = null;
  /** CursorTarget component of the currently hovered object */
  hoveringObjectTarget = null;
  /** Whether the cursor is hovering reality via hit-test */
  hoveringReality = false;
  /**
   * Global target lets you receive global cursor events on any object.
   */
  globalTarget = new CursorTargetEmitters();
  /**
   * Hit test target lets you receive cursor events for "reality", if
   * `useWebXRHitTest` is set to `true`.
   *
   * @example
   * ```js
   * cursor.hitTestTarget.onClick.add((hit, cursor) => {
   *     // User clicked on reality
   * });
   * ```
   */
  hitTestTarget = new CursorTargetEmitters();
  /** World position of the cursor */
  cursorPos = new Float32Array(3);
  /** Collision group for the ray cast. Only objects in this group will be affected by this cursor. */
  collisionGroup = 1;
  /** (optional) Object that visualizes the cursor's ray. */
  cursorRayObject = null;
  /** Axis along which to scale the `cursorRayObject`. */
  cursorRayScalingAxis = 2;
  /** (optional) Object that visualizes the cursor's hit location. */
  cursorObject = null;
  /** Handedness for VR cursors to accept trigger events only from respective controller. */
  handedness = 0;
  /** Object that has an input component. */
  inputObject = null;
  /** Object that has a view component. */
  viewObject = null;
  /** Mode for raycasting, whether to use PhysX or simple collision components */
  rayCastMode = 0;
  /** Maximum distance for the cursor's ray cast. */
  maxDistance = 100;
  /** Whether to set the CSS style of the mouse cursor on desktop */
  styleCursor = true;
  /**
   * Use WebXR hit-test if available.
   *
   * Attaches a hit-test-location component to the cursorObject, which will be used
   * by the cursor to send events to the hitTestTarget with HitTestResult.
   */
  useWebXRHitTest = false;
  _onViewportResize = () => {
    if (!this._viewComponent)
      return;
    mat4_exports.invert(this._projectionMatrix, this._viewComponent.projectionMatrix);
  };
  start() {
    this._collisionMask = 1 << this.collisionGroup;
    if (this.handedness == 0) {
      const inputCompObj = this.inputObject || this.object;
      const inputComp = inputCompObj.getComponent(InputComponent);
      if (!inputComp) {
        console.warn("cursor component on object", this.object.name, 'was configured with handedness "input component", but object has no input component.');
      } else {
        this.handedness = inputComp.handedness || "none";
        this._input = inputComp;
      }
    } else {
      this.handedness = ["left", "right", "none"][this.handedness - 1];
    }
    const viewObject = this.viewObject || this.object;
    this._viewComponent = viewObject.getComponent(ViewComponent);
    if (this.useWebXRHitTest) {
      this._hitTestObject = this.engine.scene.addObject(this.object);
      this._hitTestLocation = this._hitTestObject.addComponent(HitTestLocation, {
        scaleObject: false
      }) ?? null;
    }
    this._onSessionStartCallback = this.setupVREvents.bind(this);
  }
  onActivate() {
    this.engine.onXRSessionStart.add(this._onSessionStartCallback);
    this.engine.onResize.add(this._onViewportResize);
    this._setCursorVisibility(true);
    if (this._viewComponent != null) {
      const canvas2 = this.engine.canvas;
      const onClick = this.onClick.bind(this);
      const onPointerMove = this.onPointerMove.bind(this);
      const onPointerDown = this.onPointerDown.bind(this);
      const onPointerUp = this.onPointerUp.bind(this);
      canvas2.addEventListener("click", onClick);
      canvas2.addEventListener("pointermove", onPointerMove);
      canvas2.addEventListener("pointerdown", onPointerDown);
      canvas2.addEventListener("pointerup", onPointerUp);
      this._onDeactivateCallbacks.push(() => {
        canvas2.removeEventListener("click", onClick);
        canvas2.removeEventListener("pointermove", onPointerMove);
        canvas2.removeEventListener("pointerdown", onPointerDown);
        canvas2.removeEventListener("pointerup", onPointerUp);
      });
    }
    this._onViewportResize();
  }
  _setCursorRayTransform(hitPosition) {
    if (!this.cursorRayObject)
      return;
    const dist2 = vec3_exports.dist(this._origin, hitPosition);
    this.cursorRayObject.setPositionLocal([0, 0, -dist2 / 2]);
    if (this.cursorRayScalingAxis != 4) {
      tempVec2.fill(1);
      tempVec2[this.cursorRayScalingAxis] = dist2 / 2;
      this.cursorRayObject.setScalingLocal(tempVec2);
    }
  }
  _setCursorVisibility(visible) {
    if (this.visible == visible)
      return;
    this.visible = visible;
    if (!this.cursorObject)
      return;
    if (visible) {
      this.cursorObject.setScalingWorld(this._cursorObjScale);
    } else {
      this.cursorObject.getScalingWorld(this._cursorObjScale);
      this.cursorObject.scaleLocal([0, 0, 0]);
    }
  }
  update() {
    if (this.engine.xr && this._arTouchDown && this._input && this.engine.xr.session.inputSources[0].handedness === "none" && this.engine.xr.session.inputSources[0].gamepad) {
      const p = this.engine.xr.session.inputSources[0].gamepad.axes;
      this._direction[0] = p[0];
      this._direction[1] = -p[1];
      this._direction[2] = -1;
      this.applyTransformAndProjectDirection();
    } else if (this.engine.xr && this._input && this._input.xrInputSource) {
      this._direction[0] = 0;
      this._direction[1] = 0;
      this._direction[2] = -1;
      this.applyTransformToDirection();
    } else if (this._viewComponent) {
      this.updateDirection();
    }
    this.rayCast(null, this.engine.xr?.frame);
    if (this.cursorObject) {
      if (this.hoveringObject && (this.cursorPos[0] != 0 || this.cursorPos[1] != 0 || this.cursorPos[2] != 0)) {
        this._setCursorVisibility(true);
        this.cursorObject.setPositionWorld(this.cursorPos);
        this._setCursorRayTransform(this.cursorPos);
      } else {
        this._setCursorVisibility(false);
      }
    }
  }
  /* Returns the hovered cursor target, if available */
  notify(event, originalEvent) {
    const target = this.hoveringObject;
    if (target) {
      const cursorTarget = this.hoveringObjectTarget;
      if (cursorTarget)
        cursorTarget[event].notify(target, this, originalEvent ?? void 0);
      this.globalTarget[event].notify(target, this, originalEvent ?? void 0);
    }
  }
  hoverBehaviour(rayHit, hitTestResult, doClick, originalEvent) {
    const hit = !this.hoveringReality && rayHit.hitCount > 0 ? rayHit.objects[0] : null;
    if (hit) {
      if (!this.hoveringObject || !this.hoveringObject.equals(hit)) {
        if (this.hoveringObject) {
          this.notify("onUnhover", originalEvent);
        }
        this.hoveringObject = hit;
        this.hoveringObjectTarget = this.hoveringObject.getComponent(CursorTarget);
        if (this.styleCursor)
          this.engine.canvas.style.cursor = "pointer";
        this.notify("onHover", originalEvent);
      }
    } else if (this.hoveringObject) {
      this.notify("onUnhover", originalEvent);
      this.hoveringObject = null;
      this.hoveringObjectTarget = null;
      if (this.styleCursor)
        this.engine.canvas.style.cursor = "default";
    }
    if (this.hoveringObject) {
      if (this._isDown !== this._lastIsDown) {
        this.notify(this._isDown ? "onDown" : "onUp", originalEvent);
      }
      if (doClick)
        this.notify("onClick", originalEvent);
    } else if (this.hoveringReality) {
      if (this._isDown !== this._lastIsDown) {
        (this._isDown ? this.hitTestTarget.onDown : this.hitTestTarget.onUp).notify(hitTestResult, this, originalEvent ?? void 0);
      }
      if (doClick)
        this.hitTestTarget.onClick.notify(hitTestResult, this, originalEvent ?? void 0);
    }
    if (hit) {
      if (this.hoveringObject) {
        this.hoveringObject.transformPointInverseWorld(tempVec2, this.cursorPos);
      } else {
        tempVec2.set(this.cursorPos);
      }
      if (!vec3_exports.equals(this._lastCursorPosOnTarget, tempVec2)) {
        this.notify("onMove", originalEvent);
        this._lastCursorPosOnTarget.set(tempVec2);
      }
    } else if (this.hoveringReality) {
      if (!vec3_exports.equals(this._lastCursorPosOnTarget, this.cursorPos)) {
        this.hitTestTarget.onMove.notify(hitTestResult, this, originalEvent ?? void 0);
        this._lastCursorPosOnTarget.set(this.cursorPos);
      }
    } else {
      this._lastCursorPosOnTarget.set(this.cursorPos);
    }
    this._lastIsDown = this._isDown;
  }
  /**
   * Setup event listeners on session object
   * @param s WebXR session
   *
   * Sets up 'select' and 'end' events.
   */
  setupVREvents(s) {
    if (!s)
      console.error("setupVREvents called without a valid session");
    if (!this.active)
      return;
    const onSelect = this.onSelect.bind(this);
    s.addEventListener("select", onSelect);
    const onSelectStart = this.onSelectStart.bind(this);
    s.addEventListener("selectstart", onSelectStart);
    const onSelectEnd = this.onSelectEnd.bind(this);
    s.addEventListener("selectend", onSelectEnd);
    this._onDeactivateCallbacks.push(() => {
      if (!this.engine.xr)
        return;
      s.removeEventListener("select", onSelect);
      s.removeEventListener("selectstart", onSelectStart);
      s.removeEventListener("selectend", onSelectEnd);
    });
    this._onViewportResize();
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this._onSessionStartCallback);
    this.engine.onResize.remove(this._onViewportResize);
    this._setCursorVisibility(false);
    if (this.hoveringObject)
      this.notify("onUnhover", null);
    if (this.cursorRayObject)
      this.cursorRayObject.setScalingLocal(ZERO);
    for (const f of this._onDeactivateCallbacks)
      f();
    this._onDeactivateCallbacks.length = 0;
  }
  onDestroy() {
    this._hitTestObject?.destroy();
  }
  /** 'select' event listener */
  onSelect(e) {
    if (e.inputSource.handedness != this.handedness)
      return;
    this.rayCast(e, e.frame, true);
  }
  /** 'selectstart' event listener */
  onSelectStart(e) {
    this._arTouchDown = true;
    if (e.inputSource.handedness == this.handedness) {
      this._isDown = true;
      this.rayCast(e, e.frame);
    }
  }
  /** 'selectend' event listener */
  onSelectEnd(e) {
    this._arTouchDown = false;
    if (e.inputSource.handedness == this.handedness) {
      this._isDown = false;
      this.rayCast(e, e.frame);
    }
  }
  /** 'pointermove' event listener */
  onPointerMove(e) {
    if (!e.isPrimary)
      return;
    this.updateMousePos(e);
    this.rayCast(e, null);
  }
  /** 'click' event listener */
  onClick(e) {
    this.updateMousePos(e);
    this.rayCast(e, null, true);
  }
  /** 'pointerdown' event listener */
  onPointerDown(e) {
    if (!e.isPrimary || e.button !== 0)
      return;
    this.updateMousePos(e);
    this._isDown = true;
    this.rayCast(e);
  }
  /** 'pointerup' event listener */
  onPointerUp(e) {
    if (!e.isPrimary || e.button !== 0)
      return;
    this.updateMousePos(e);
    this._isDown = false;
    this.rayCast(e);
  }
  /**
   * Update mouse position in non-VR mode and raycast for new position
   * @returns @ref RayHit for new position.
   */
  updateMousePos(e) {
    this._lastPointerPos[0] = e.clientX;
    this._lastPointerPos[1] = e.clientY;
    this.updateDirection();
  }
  updateDirection() {
    const bounds = this.engine.canvas.getBoundingClientRect();
    const left = this._lastPointerPos[0] / bounds.width;
    const top = this._lastPointerPos[1] / bounds.height;
    this._direction[0] = left * 2 - 1;
    this._direction[1] = -top * 2 + 1;
    this._direction[2] = -1;
    this.applyTransformAndProjectDirection();
  }
  applyTransformAndProjectDirection() {
    vec3_exports.transformMat4(this._direction, this._direction, this._projectionMatrix);
    vec3_exports.normalize(this._direction, this._direction);
    this.applyTransformToDirection();
  }
  applyTransformToDirection() {
    this.object.transformVectorWorld(this._direction, this._direction);
    this.object.getPositionWorld(this._origin);
  }
  rayCast(originalEvent, frame = null, doClick = false) {
    const rayHit = this.rayCastMode == 0 ? this.engine.scene.rayCast(this._origin, this._direction, this._collisionMask) : this.engine.physics.rayCast(this._origin, this._direction, this._collisionMask, this.maxDistance);
    let hitResultDistance = Infinity;
    let hitTestResult = null;
    if (this._hitTestLocation?.visible) {
      this._hitTestObject.getPositionWorld(this.cursorPos);
      hitResultDistance = vec3_exports.distance(this.object.getPositionWorld(tempVec2), this.cursorPos);
      hitTestResult = this._hitTestLocation?.getHitTestResults(frame)[0];
    }
    let hoveringReality = false;
    if (rayHit.hitCount > 0) {
      const d = rayHit.distances[0];
      if (hitResultDistance >= d) {
        this.cursorPos.set(rayHit.locations[0]);
      } else {
        hoveringReality = true;
      }
    } else if (hitResultDistance < Infinity) {
    } else {
      this.cursorPos.fill(0);
    }
    if (hoveringReality && !this.hoveringReality) {
      this.hitTestTarget.onHover.notify(hitTestResult, this);
    } else if (!hoveringReality && this.hoveringReality) {
      this.hitTestTarget.onUnhover.notify(hitTestResult, this);
    }
    this.hoveringReality = hoveringReality;
    this.hoverBehaviour(rayHit, hitTestResult, doClick, originalEvent);
    return rayHit;
  }
};
__publicField(Cursor, "TypeName", "cursor");
/* Dependencies is deprecated, but we keep it here for compatibility
 * with 1.0.0-rc2 until 1.0.0 is released */
__publicField(Cursor, "Dependencies", [HitTestLocation]);
__decorate4([
  property.int(1)
], Cursor.prototype, "collisionGroup", void 0);
__decorate4([
  property.object()
], Cursor.prototype, "cursorRayObject", void 0);
__decorate4([
  property.enum(["x", "y", "z", "none"], "z")
], Cursor.prototype, "cursorRayScalingAxis", void 0);
__decorate4([
  property.object()
], Cursor.prototype, "cursorObject", void 0);
__decorate4([
  property.enum(["input component", "left", "right", "none"], "input component")
], Cursor.prototype, "handedness", void 0);
__decorate4([
  property.object()
], Cursor.prototype, "inputObject", void 0);
__decorate4([
  property.object()
], Cursor.prototype, "viewObject", void 0);
__decorate4([
  property.enum(["collision", "physx"], "collision")
], Cursor.prototype, "rayCastMode", void 0);
__decorate4([
  property.float(100)
], Cursor.prototype, "maxDistance", void 0);
__decorate4([
  property.bool(true)
], Cursor.prototype, "styleCursor", void 0);
__decorate4([
  property.bool(false)
], Cursor.prototype, "useWebXRHitTest", void 0);

// node_modules/@wonderlandengine/components/dist/debug-object.js
var __decorate5 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DebugObject = class extends Component3 {
  /** A second object to print the name of */
  obj = null;
  start() {
    let origin = new Float32Array(3);
    quat2_exports.getTranslation(origin, this.object.transformWorld);
    console.log("Debug object:", this.object.name);
    console.log("Other object:", this.obj?.name);
    console.log("	translation", origin);
    console.log("	transformWorld", this.object.transformWorld);
    console.log("	transformLocal", this.object.transformLocal);
  }
};
__publicField(DebugObject, "TypeName", "debug-object");
__decorate5([
  property.object()
], DebugObject.prototype, "obj", void 0);

// node_modules/@wonderlandengine/components/dist/fixed-foveation.js
var __decorate6 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FixedFoveation = class extends Component3 {
  /** Amount to apply from 0 (none) to 1 (full) */
  fixedFoveation;
  onActivate() {
    this.engine.onXRSessionStart.add(this.setFixedFoveation);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.setFixedFoveation);
  }
  setFixedFoveation = () => {
    this.engine.xr.baseLayer.fixedFoveation = this.fixedFoveation;
  };
};
__publicField(FixedFoveation, "TypeName", "fixed-foveation");
__decorate6([
  property.float(0.5)
], FixedFoveation.prototype, "fixedFoveation", void 0);

// node_modules/@wonderlandengine/components/dist/hand-tracking.js
var __decorate7 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ORDERED_JOINTS = [
  "wrist",
  "thumb-metacarpal",
  "thumb-phalanx-proximal",
  "thumb-phalanx-distal",
  "thumb-tip",
  "index-finger-metacarpal",
  "index-finger-phalanx-proximal",
  "index-finger-phalanx-intermediate",
  "index-finger-phalanx-distal",
  "index-finger-tip",
  "middle-finger-metacarpal",
  "middle-finger-phalanx-proximal",
  "middle-finger-phalanx-intermediate",
  "middle-finger-phalanx-distal",
  "middle-finger-tip",
  "ring-finger-metacarpal",
  "ring-finger-phalanx-proximal",
  "ring-finger-phalanx-intermediate",
  "ring-finger-phalanx-distal",
  "ring-finger-tip",
  "pinky-finger-metacarpal",
  "pinky-finger-phalanx-proximal",
  "pinky-finger-phalanx-intermediate",
  "pinky-finger-phalanx-distal",
  "pinky-finger-tip"
];
var invTranslation = vec3_exports.create();
var invRotation = quat_exports.create();
var tempVec0 = vec3_exports.create();
var tempVec1 = vec3_exports.create();
var HandTracking = class extends Component3 {
  /** Handedness determining whether to receive tracking input from right or left hand */
  handedness = 0;
  /** (optional) Mesh to use to visualize joints */
  jointMesh = null;
  /** Material to use for display. Applied to either the spawned skinned mesh or the joint spheres. */
  jointMaterial = null;
  /** (optional) Skin to apply tracked joint poses to. If not present,
   * joint spheres will be used for display instead. */
  handSkin = null;
  /** Deactivate children if no pose was tracked */
  deactivateChildrenWithoutPose = true;
  /** Controller objects to activate including children if no pose is available */
  controllerToDeactivate = null;
  init() {
    this.handedness = ["left", "right"][this.handedness];
  }
  joints = {};
  session = null;
  /* Whether last update had a hand pose */
  hasPose = false;
  _childrenActive = true;
  start() {
    if (!("XRHand" in window)) {
      console.warn("WebXR Hand Tracking not supported by this browser.");
      this.active = false;
      return;
    }
    if (this.handSkin) {
      const skin = this.handSkin;
      const jointIds = skin.jointIds;
      this.joints[ORDERED_JOINTS[0]] = this.engine.wrapObject(jointIds[0]);
      for (let j = 0; j < jointIds.length; ++j) {
        const joint = this.engine.wrapObject(jointIds[j]);
        this.joints[joint.name] = joint;
      }
      return;
    }
    const jointObjects = this.engine.scene.addObjects(ORDERED_JOINTS.length, this.object, ORDERED_JOINTS.length);
    for (let j = 0; j < ORDERED_JOINTS.length; ++j) {
      const joint = jointObjects[j];
      joint.addComponent(MeshComponent, {
        mesh: this.jointMesh,
        material: this.jointMaterial
      });
      this.joints[ORDERED_JOINTS[j]] = joint;
      joint.name = ORDERED_JOINTS[j];
    }
  }
  update(dt) {
    if (!this.engine.xr)
      return;
    this.hasPose = false;
    if (this.engine.xr.session.inputSources) {
      for (let i = 0; i < this.engine.xr.session.inputSources.length; ++i) {
        const inputSource = this.engine.xr.session.inputSources[i];
        if (!inputSource?.hand || inputSource?.handedness != this.handedness)
          continue;
        const wristSpace = inputSource.hand.get("wrist");
        if (wristSpace) {
          const p = this.engine.xr.frame.getJointPose(wristSpace, this.engine.xr.currentReferenceSpace);
          if (p) {
            setXRRigidTransformLocal(this.object, p.transform);
          }
        }
        this.object.getRotationLocal(invRotation);
        quat_exports.conjugate(invRotation, invRotation);
        this.object.getPositionLocal(invTranslation);
        this.joints["wrist"].resetTransform();
        for (let j = 0; j < ORDERED_JOINTS.length; ++j) {
          const jointName = ORDERED_JOINTS[j];
          const joint = this.joints[jointName];
          if (!joint)
            continue;
          let jointPose = null;
          const jointSpace = inputSource.hand.get(jointName);
          if (jointSpace) {
            jointPose = this.engine.xr.frame.getJointPose(jointSpace, this.engine.xr.currentReferenceSpace);
          }
          if (jointPose) {
            this.hasPose = true;
            joint.resetPositionRotation();
            joint.translateLocal([
              jointPose.transform.position.x - invTranslation[0],
              jointPose.transform.position.y - invTranslation[1],
              jointPose.transform.position.z - invTranslation[2]
            ]);
            joint.rotateLocal(invRotation);
            joint.rotateObject([
              jointPose.transform.orientation.x,
              jointPose.transform.orientation.y,
              jointPose.transform.orientation.z,
              jointPose.transform.orientation.w
            ]);
            if (!this.handSkin) {
              const r = jointPose.radius || 7e-3;
              joint.setScalingLocal([r, r, r]);
            }
          }
        }
      }
    }
    if (!this.hasPose && this._childrenActive) {
      this._childrenActive = false;
      if (this.deactivateChildrenWithoutPose) {
        this.setChildrenActive(false);
      }
      if (this.controllerToDeactivate) {
        this.controllerToDeactivate.active = true;
        this.setChildrenActive(true, this.controllerToDeactivate);
      }
    } else if (this.hasPose && !this._childrenActive) {
      this._childrenActive = true;
      if (this.deactivateChildrenWithoutPose) {
        this.setChildrenActive(true);
      }
      if (this.controllerToDeactivate) {
        this.controllerToDeactivate.active = false;
        this.setChildrenActive(false, this.controllerToDeactivate);
      }
    }
  }
  setChildrenActive(active, object) {
    object = object || this.object;
    const children = object.children;
    for (const o of children) {
      o.active = active;
      this.setChildrenActive(active, o);
    }
  }
  isGrabbing() {
    this.joints["index-finger-tip"].getPositionLocal(tempVec0);
    this.joints["thumb-tip"].getPositionLocal(tempVec1);
    return vec3_exports.sqrDist(tempVec0, tempVec1) < 1e-3;
  }
};
__publicField(HandTracking, "TypeName", "hand-tracking");
__decorate7([
  property.enum(["left", "right"])
], HandTracking.prototype, "handedness", void 0);
__decorate7([
  property.mesh()
], HandTracking.prototype, "jointMesh", void 0);
__decorate7([
  property.material()
], HandTracking.prototype, "jointMaterial", void 0);
__decorate7([
  property.skin()
], HandTracking.prototype, "handSkin", void 0);
__decorate7([
  property.bool(true)
], HandTracking.prototype, "deactivateChildrenWithoutPose", void 0);
__decorate7([
  property.object()
], HandTracking.prototype, "controllerToDeactivate", void 0);

// node_modules/@wonderlandengine/spatial-audio/dist/audio-listener.js
var SAMPLE_RATE = 48e3;
var FADE_DURATION = 5 / 1e3;
var tempVec4 = new Float32Array(3);
var tempVec22 = new Float32Array(3);
var _audioContext = null;
if (window.AudioContext !== void 0) {
  _audioContext = new AudioContext({
    latencyHint: "interactive",
    sampleRate: SAMPLE_RATE
  });
}
async function _unlockAudioContext() {
  return new Promise((resolve) => {
    const unlockHandler = () => {
      _audioContext.resume().then(() => {
        window.removeEventListener("click", unlockHandler);
        window.removeEventListener("touch", unlockHandler);
        window.removeEventListener("keydown", unlockHandler);
        window.removeEventListener("mousedown", unlockHandler);
        resolve();
      });
    };
    window.addEventListener("click", unlockHandler);
    window.addEventListener("touch", unlockHandler);
    window.addEventListener("keydown", unlockHandler);
    window.addEventListener("mousedown", unlockHandler);
  });
}
var AudioListener = class extends Component3 {
  /**
   * The WebAudio listener instance associated with this component.
   */
  listener = _audioContext.listener;
  /**
   * The time in which the last position update will be done.
   */
  time = 0;
  start() {
    if ("positionX" in this.listener) {
      this.update = this._updateRecommended.bind(this);
    } else {
      this.update = this._updateDeprecated.bind(this);
    }
  }
  _updateDeprecated() {
    this.object.getPositionWorld(tempVec4);
    this.listener.setPosition(tempVec4[0], tempVec4[2], -tempVec4[1]);
    this.object.getForwardWorld(tempVec4);
    this.object.getUpWorld(tempVec22);
    this.listener.setOrientation(tempVec4[0], tempVec4[2], -tempVec4[1], tempVec22[0], tempVec22[2], -tempVec22[1]);
  }
  _updateRecommended() {
    this.time = _audioContext.currentTime + FADE_DURATION;
    this.object.getPositionWorld(tempVec4);
    this.listener.positionX.linearRampToValueAtTime(tempVec4[0], this.time);
    this.listener.positionY.linearRampToValueAtTime(tempVec4[2], this.time);
    this.listener.positionZ.linearRampToValueAtTime(-tempVec4[1], this.time);
    this.object.getForwardWorld(tempVec4);
    this.listener.forwardX.linearRampToValueAtTime(tempVec4[0], this.time);
    this.listener.forwardY.linearRampToValueAtTime(tempVec4[2], this.time);
    this.listener.forwardZ.linearRampToValueAtTime(-tempVec4[1], this.time);
    this.object.getUpWorld(tempVec4);
    this.listener.upX.linearRampToValueAtTime(tempVec4[0], this.time);
    this.listener.upY.linearRampToValueAtTime(tempVec4[2], this.time);
    this.listener.upZ.linearRampToValueAtTime(-tempVec4[1], this.time);
  }
};
__publicField(AudioListener, "TypeName", "audio-listener");
__publicField(AudioListener, "Properties", {});

// node_modules/@wonderlandengine/spatial-audio/dist/audio-players.js
var MIN_RAMP_TIME = 5 / 1e3;
var MIN_VOLUME = 1e-3;
var DEF_VOL = 1;
var DEFAULT_PANNER_CONFIG = {
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0,
  distanceModel: "exponential",
  maxDistance: 1e4,
  refDistance: 1,
  rolloffFactor: 1,
  panningModel: "HRTF",
  positionX: 0,
  positionY: 0,
  positionZ: 1,
  orientationX: 0,
  orientationY: 0,
  orientationZ: 1
};
var BufferPlayer = class {
  playId = -1;
  buffer = _audioContext.createBuffer(1, _audioContext.sampleRate, _audioContext.sampleRate);
  looping = false;
  position;
  priority = false;
  playOffset = 0;
  channel = AudioChannel.Sfx;
  volume = DEF_VOL;
  oneShot = false;
  _gainNode = new GainNode(_audioContext);
  _pannerNode = new PannerNode(_audioContext, DEFAULT_PANNER_CONFIG);
  _audioNode = new AudioBufferSourceNode(_audioContext);
  _pannerOptions = DEFAULT_PANNER_CONFIG;
  _playState = PlayState.Stopped;
  _timeStamp = 0;
  _audioManager;
  /**
   * Constructs a BufferPlayer.
   *
   * @warning This is for internal use only. BufferPlayer's should only be created and used inside the AudioManager.
   * @param audioManager Manager that manages this player.
   */
  constructor(audioManager) {
    this._audioManager = audioManager;
  }
  play() {
    if (this._playState === PlayState.Playing) {
      this.stop();
    }
    switch (this.channel) {
      case AudioChannel.Music:
        this._gainNode.connect(this._audioManager["_musicGain"]);
        break;
      case AudioChannel.Master:
        this._gainNode.connect(this._audioManager["_masterGain"]);
        break;
      default:
        this._gainNode.connect(this._audioManager["_sfxGain"]);
    }
    this._gainNode.gain.value = this.volume;
    this._audioNode.buffer = this.buffer;
    this._audioNode.loop = this.looping;
    if (this.position) {
      this._pannerOptions.positionX = this.position[0];
      this._pannerOptions.positionY = this.position[2];
      this._pannerOptions.positionZ = -this.position[1];
      this._pannerNode = new PannerNode(_audioContext, this._pannerOptions);
      this._audioNode.connect(this._pannerNode).connect(this._gainNode);
    } else {
      this._audioNode.connect(this._gainNode);
    }
    this._audioNode.start(0, this.playOffset);
    this._timeStamp = _audioContext.currentTime - this.playOffset;
    this._audioNode.onended = () => this.stop();
    this._playState = PlayState.Playing;
    this.emitState();
  }
  emitState() {
    this._audioManager.emitter.notify({ id: this.playId, state: this._playState });
  }
  /**
   * Stops current playback and sends notification on the audio managers emitter.
   */
  stop() {
    if (this._playState === PlayState.Stopped)
      return;
    this._resetWebAudioNodes();
    if (this.priority) {
      this._audioManager._returnPriorityPlayer(this);
    }
    this._playState = PlayState.Stopped;
    this.emitState();
  }
  pause() {
    if (this._playState !== PlayState.Playing)
      return;
    this.playOffset = (_audioContext.currentTime - this._timeStamp) % this.buffer.duration;
    this._resetWebAudioNodes();
    this._playState = PlayState.Paused;
    this.emitState();
  }
  resume() {
    if (this._playState !== PlayState.Paused)
      return;
    this.play();
  }
  _resetWebAudioNodes() {
    this._audioNode.onended = null;
    this._audioNode.stop();
    this._audioNode.disconnect();
    this._pannerNode.disconnect();
    this._gainNode.disconnect();
    this._audioNode = new AudioBufferSourceNode(_audioContext);
  }
};

// node_modules/@wonderlandengine/spatial-audio/dist/audio-manager.js
var AudioChannel;
(function(AudioChannel2) {
  AudioChannel2[AudioChannel2["Sfx"] = 0] = "Sfx";
  AudioChannel2[AudioChannel2["Music"] = 1] = "Music";
  AudioChannel2[AudioChannel2["Master"] = 2] = "Master";
})(AudioChannel || (AudioChannel = {}));
var PlayState;
(function(PlayState2) {
  PlayState2[PlayState2["Ready"] = 0] = "Ready";
  PlayState2[PlayState2["Playing"] = 1] = "Playing";
  PlayState2[PlayState2["Stopped"] = 2] = "Stopped";
  PlayState2[PlayState2["Paused"] = 3] = "Paused";
})(PlayState || (PlayState = {}));
var DEF_PLAYER_COUNT = 32;
var SHIFT_AMOUNT = 16;
var MAX_NUMBER_OF_INSTANCES = (1 << SHIFT_AMOUNT) - 1;
var AudioManager = class {
  /** The emitter will notify all listeners about the PlayState of a unique ID.
   *
   * @remarks
   * - READY will be emitted if all sources of a given source ID have loaded.
   * - PLAYING / STOPPED / PAUSED are only emitted for play IDs that are returned by the play() method.
   * - If you want to check the status for a source ID, convert the play ID of the message using the
   *   getSourceIdFromPlayId() method.
   *
   * @see getSourceIdFromPlayId
   * @example
   * ```js
   * const music = audioManager.play(Sounds.Music);
   * audioManager.emitter.add((msg) => {
   *    if (msg.id === music) {
   *          console.log(msg.state);
   *    }
   * });
   * ```
   */
  emitter = new Emitter();
  /**
   * Sets the random function the manager will use for selecting buffers.
   *
   * @remarks Default random function is Math.random()
   * @param func Function that should be used for select the buffer.
   */
  randomBufferSelectFunction = Math.random;
  /* Cache for decoded audio buffers */
  _bufferCache = [];
  /* Simple, fast cache for players */
  _playerCache = [];
  _playerCacheIndex = 0;
  _amountOfFreePlayers = DEF_PLAYER_COUNT;
  /* Counts how many times a sourceId has played. Resets to 0 after {@link MAX_NUMBER_OF_INSTANCES }. */
  _instanceCounter = [];
  _masterGain;
  _musicGain;
  _sfxGain;
  _unlocked = false;
  _autoplayStorage = [];
  /**
   * Constructs a AudioManager.
   *
   * Uses the default amount of players.
   * @see DEF_PLAYER_COUNT
   * @example
   * ```js
   * // AudioManager can't be constructed in a non-browser environment!
   * export const am = window.AudioContext ? new AudioManager() : null!;
   * ```
   */
  constructor() {
    this._unlockAudioContext();
    this._sfxGain = new GainNode(_audioContext);
    this._masterGain = new GainNode(_audioContext);
    this._musicGain = new GainNode(_audioContext);
    this._sfxGain.connect(this._masterGain);
    this._musicGain.connect(this._masterGain);
    this._masterGain.connect(_audioContext.destination);
    for (let i = 0; i < DEF_PLAYER_COUNT; i++) {
      this._playerCache.push(new BufferPlayer(this));
    }
  }
  async load(path, id) {
    if (id < 0) {
      console.error("audio-manager: Negative IDs are not valid! Skipping ${path}.");
      return;
    }
    const paths = Array.isArray(path) ? path : [path];
    if (!this._bufferCache[id]) {
      this._bufferCache[id] = [];
    }
    this._instanceCounter[id] = -1;
    for (let i = 0; i < paths.length; i++) {
      const response = await fetch(paths[i]);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await _audioContext.decodeAudioData(arrayBuffer);
      this._bufferCache[id].push(audioBuffer);
    }
    this._instanceCounter[id] = 0;
    this.emitter.notify({ id, state: PlayState.Ready });
  }
  async loadBatch(...pair) {
    return Promise.all(pair.map((p) => this.load(p[0], p[1])));
  }
  play(id, config) {
    if (this._instanceCounter[id] == -1) {
      console.warn(`audio-manager: Tried to play audio that is still decoding: ${id}`);
      return -1;
    }
    const bufferList = this._bufferCache[id];
    if (!bufferList) {
      console.error(`audio-manager: No audio source is associated with identifier: ${id}`);
      return -1;
    }
    if (!this._unlocked) {
      return -1;
    }
    const player = this._getAvailablePlayer();
    if (!player) {
      console.warn(`audio-manager: All players are busy and no low priority player could be found to free up to play ${id}.`);
      return -1;
    }
    const unique_id = this._generateUniqueId(id);
    if (config?.priority) {
      this._amountOfFreePlayers--;
      let index = this._playerCache.indexOf(player);
      this._playerCache.splice(index, 1);
      this._playerCache.push(player);
      player.priority = true;
    } else {
      player.priority = false;
    }
    player.playId = unique_id;
    player.buffer = this._selectRandomBuffer(bufferList);
    player.looping = config?.loop ?? false;
    player.position = config?.position;
    player.playOffset = config?.playOffset ?? 0;
    player.channel = config?.channel ?? AudioChannel.Sfx;
    player.volume = config?.volume ?? DEF_VOL;
    player.play();
    return unique_id;
  }
  _playWithUniqueId(uniqueId, config) {
    const id = this.getSourceIdFromPlayId(uniqueId);
    const bufferList = this._bufferCache[id];
    if (!bufferList) {
      console.error(`audio-manager: No audio source is associated with identifier: ${id}`);
      return;
    }
    const player = this._getAvailablePlayer();
    if (!player) {
      console.warn(`audio-manager: All players are busy and no low priority player could be found to free up.`);
      return;
    }
    if (config?.priority) {
      this._amountOfFreePlayers--;
      let index = this._playerCache.indexOf(player);
      this._playerCache.splice(index, 1);
      this._playerCache.push(player);
      player.priority = true;
    } else {
      player.priority = false;
    }
    player.playId = uniqueId;
    player.buffer = this._selectRandomBuffer(bufferList);
    player.looping = config?.loop ?? false;
    player.oneShot = config?.oneShot ?? false;
    player.position = config?.position;
    player.playOffset = config?.playOffset ?? 0;
    player.channel = config?.channel ?? AudioChannel.Sfx;
    player.volume = config?.volume ?? DEF_VOL;
    player.play();
  }
  playOneShot(id, config) {
    if (!config)
      this.play(id, { oneShot: true });
    config.loop = false;
    config.priority = false;
    config.oneShot = true;
    this.play(id, config);
  }
  /**
   * Advances the _playerCacheIndex and stops the player on that position.
   *
   * @returns A BufferPlayer with PlayState.Stopped, or undefined if no player can be stopped.
   */
  _getAvailablePlayer() {
    if (this._amountOfFreePlayers < 1)
      return;
    this._playerCacheIndex = (this._playerCacheIndex + 1) % this._amountOfFreePlayers;
    const player = this._playerCache[this._playerCacheIndex];
    player.stop();
    return player;
  }
  autoplay(id, config) {
    if (this._unlocked) {
      return this.play(id, config);
    }
    const uniqueId = this._generateUniqueId(id);
    this._autoplayStorage.push([uniqueId, config]);
    return uniqueId;
  }
  stop(playId) {
    this._playerCache.forEach((player) => {
      if (player.playId === playId) {
        player.stop();
        return;
      }
    });
  }
  pause(playId) {
    this._playerCache.forEach((player) => {
      if (player.playId === playId) {
        player.pause();
        return;
      }
    });
  }
  resume(playId) {
    this._playerCache.forEach((player) => {
      if (player.playId === playId) {
        player.resume();
        return;
      }
    });
  }
  stopOneShots() {
    this._playerCache.forEach((player) => {
      if (player.oneShot) {
        player.stop();
        return;
      }
    });
  }
  resumeAll() {
    this._playerCache.forEach((player) => {
      player.resume();
    });
  }
  pauseAll() {
    this._playerCache.forEach((player) => {
      player.pause();
    });
  }
  stopAll() {
    this._playerCache.forEach((player) => {
      player.stop();
    });
  }
  setGlobalVolume(channel, volume, time = 0) {
    volume = Math.max(MIN_VOLUME, volume);
    time = _audioContext.currentTime + Math.max(MIN_RAMP_TIME, time);
    switch (channel) {
      case AudioChannel.Music:
        this._musicGain.gain.linearRampToValueAtTime(volume, time);
        break;
      case AudioChannel.Sfx:
        this._sfxGain.gain.linearRampToValueAtTime(volume, time);
        break;
      case AudioChannel.Master:
        this._masterGain.gain.linearRampToValueAtTime(volume, time);
        break;
      default:
        return;
    }
  }
  remove(id) {
    if (id < 0)
      return;
    this.stop(id);
    this._bufferCache[id] = void 0;
    this._instanceCounter[id] = -1;
  }
  removeAll() {
    this.stopAll();
    this._bufferCache.length = 0;
    this._instanceCounter.length = 0;
  }
  getSourceIdFromPlayId(playId) {
    return playId >> SHIFT_AMOUNT;
  }
  get amountOfFreePlayers() {
    return this._amountOfFreePlayers;
  }
  _selectRandomBuffer(bufferList) {
    return bufferList[Math.floor(this.randomBufferSelectFunction() * bufferList.length)];
  }
  _generateUniqueId(id) {
    let instanceCount = this._instanceCounter[id];
    if (!instanceCount)
      instanceCount = 0;
    else if (instanceCount === -1)
      return -1;
    const unique_id = (id << SHIFT_AMOUNT) + instanceCount;
    this._instanceCounter[id] = (instanceCount + 1) % MAX_NUMBER_OF_INSTANCES;
    return unique_id;
  }
  /**
   * @warning This function is for internal use only!
   */
  _returnPriorityPlayer(player) {
    if (!player.priority)
      return;
    for (let i = this._playerCache.length - 1; i >= 0; i--) {
      if (this._playerCache[i] === player) {
        this._playerCache.splice(i, 1);
        this._playerCache.unshift(player);
        this._amountOfFreePlayers++;
        return;
      }
    }
  }
  _unlockAudioContext() {
    const unlockHandler = () => {
      _audioContext.resume().then(() => {
        window.removeEventListener("click", unlockHandler);
        window.removeEventListener("touch", unlockHandler);
        window.removeEventListener("keydown", unlockHandler);
        window.removeEventListener("mousedown", unlockHandler);
        this._unlocked = true;
        for (const audio of this._autoplayStorage) {
          this._playWithUniqueId(audio[0], audio[1]);
        }
        this._autoplayStorage.length = 0;
      });
    };
    window.addEventListener("click", unlockHandler);
    window.addEventListener("touch", unlockHandler);
    window.addEventListener("keydown", unlockHandler);
    window.addEventListener("mousedown", unlockHandler);
  }
};
var EmptyAudioManager = class {
  async load(path, id) {
  }
  async loadBatch(...pair) {
  }
  play(id, config) {
    return -1;
  }
  playOneShot(id, config) {
  }
  autoplay(id, config) {
    return -1;
  }
  stop(playId) {
  }
  pause(playId) {
  }
  resume(playId) {
  }
  stopOneShots() {
  }
  resumeAll() {
  }
  pauseAll() {
  }
  stopAll() {
  }
  setGlobalVolume(channel, volume, time) {
  }
  remove(id) {
  }
  removeAll() {
  }
  getSourceIdFromPlayId(playId) {
    return -1;
  }
  get amountOfFreePlayers() {
    return -1;
  }
};
var globalAudioManager = window.AudioContext ? new AudioManager() : new EmptyAudioManager();

// node_modules/@wonderlandengine/spatial-audio/dist/audio-source.js
var __decorate8 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PanningType;
(function(PanningType2) {
  PanningType2[PanningType2["None"] = 0] = "None";
  PanningType2[PanningType2["Regular"] = 1] = "Regular";
  PanningType2[PanningType2["Hrtf"] = 2] = "Hrtf";
})(PanningType || (PanningType = {}));
var posVec = new Float32Array(3);
var oriVec = new Float32Array(3);
var distanceModels = ["linear", "exponential", "inverse"];
var bufferCache = /* @__PURE__ */ new Map();
async function loadAudio(source) {
  const response = await fetch(source);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await _audioContext.decodeAudioData(arrayBuffer);
  return buffer;
}
async function addBufferToCache(source) {
  let audio;
  if (bufferCache.has(source)) {
    audio = bufferCache.get(source);
    audio.referenceCount += 1;
  } else {
    audio = {
      referenceCount: 1,
      buffer: loadAudio(source)
      // Delay await until bufferCache is set, to avoid subsequent calls with same source to start decoding
    };
    bufferCache.set(source, audio);
  }
  return await audio.buffer;
}
function removeBufferFromCache(source) {
  if (!bufferCache.has(source)) {
    return;
  }
  const audioFile = bufferCache.get(source);
  if (audioFile.referenceCount > 1) {
    audioFile.referenceCount -= 1;
  } else {
    bufferCache.delete(source);
  }
}
var AudioSource = class extends Component3 {
  static onRegister(engine2) {
    engine2.registerComponent(AudioListener);
  }
  /** Path to the audio file that should be played. */
  src;
  /**
   * Volume of the audio source.
   *
   * @remarks This will only take effect audio that has not started playing yet. Is the audio already playing, use
   * setVolumeDuringPlayback()
   * @see setVolumeDuringPlayback
   */
  volume;
  /** Whether to loop the sound. */
  loop;
  /** Whether to autoplay the sound. */
  autoplay;
  /**
   * Select the panning method.
   *
   * @warning Enabling HRTF (Head-Related Transfer Function) is computationally more intensive than regular panning!
   */
  spatial;
  /**
   * Set this property if the object will never move.
   * Disabling position updates each frame saves CPU time.
   */
  isStationary;
  /** The distance model used for spatial audio. */
  distanceModel;
  /** The maximum distance for audio falloff. */
  maxDistance;
  /** The reference distance for audio falloff. */
  refDistance;
  /** The rolloff factor for audio falloff. */
  rolloffFactor;
  /** The inner angle of the audio cone. */
  coneInnerAngle;
  /** The outer angle of the audio cone. */
  coneOuterAngle;
  /** The outer gain of the audio cone. */
  coneOuterGain;
  /**
   * The emitter will notify all subscribers when a state change occurs.
   * @see PlayState
   */
  emitter = new Emitter();
  _pannerOptions = {};
  _buffer;
  _pannerNode = new PannerNode(_audioContext);
  _audioNode = new AudioBufferSourceNode(_audioContext);
  _playState = PlayState.Ready;
  _time = 0;
  _lastPlayStartTime = 0;
  _playOffset = 0;
  _gainNode = new GainNode(_audioContext);
  /**
   * Initializes the audio src component.
   * If `autoplay` is enabled, the audio will start playing as soon as the file is loaded.
   */
  async start() {
    this._gainNode.connect(_audioContext.destination);
    if (this.src !== "") {
      this._buffer = await addBufferToCache(this.src);
      this.emitter.notify(PlayState.Ready);
      if (this.autoplay) {
        this.play();
      }
    }
  }
  setAudioChannel(am, channel) {
    this.stop();
    switch (channel) {
      case AudioChannel.Music:
        this._gainNode.disconnect();
        this._gainNode.connect(am["_musicGain"]);
        break;
      case AudioChannel.Sfx:
        this._gainNode.disconnect();
        this._gainNode.connect(am["_sfxGain"]);
        break;
      case AudioChannel.Master:
        this._gainNode.disconnect();
        this._gainNode.connect(am["_masterGain"]);
        break;
      default:
        return;
    }
  }
  /**
   * Plays the audio associated with this audio src.
   *
   * @param buffer Optional parameter that will set the raw audio buffer that should be played. Defaults to internal audio buffer that is set with given audio path.
   * @remarks Is this audio-source currently playing, playback will be restarted.
   */
  async play(buffer = this._buffer) {
    if (this._playState == PlayState.Playing) {
      this.stop();
    } else if (_audioContext.state === "suspended") {
      await _unlockAudioContext();
    }
    this._gainNode.gain.value = this.volume;
    this._audioNode.buffer = buffer;
    this._audioNode.loop = this.loop;
    if (!this.spatial) {
      this._audioNode.connect(this._gainNode);
    } else {
      this._updateSettings();
      this._pannerNode = new PannerNode(_audioContext, this._pannerOptions);
      this._audioNode.connect(this._pannerNode).connect(this._gainNode);
    }
    this._audioNode.start(0, this._playOffset);
    this._lastPlayStartTime = _audioContext.currentTime;
    this._audioNode.onended = () => this.stop();
    this._playState = PlayState.Playing;
    if (!this.isStationary) {
      this.update = this._update.bind(this);
    }
    this.emitter.notify(PlayState.Playing);
  }
  /**
   * Stops the audio associated with this audio src.
   */
  stop() {
    if (this._playState != PlayState.Playing)
      return;
    this._playState = PlayState.Stopped;
    this._audioNode.onended = null;
    this._audioNode.stop();
    this.update = void 0;
    this._audioNode.disconnect();
    this._pannerNode.disconnect();
    this._audioNode = new AudioBufferSourceNode(_audioContext);
    this._playOffset = 0;
    this.emitter.notify(PlayState.Stopped);
  }
  /**
   * Pauses the audio associated with this audio src.
   */
  pause() {
    if (this._playState !== PlayState.Playing)
      return;
    this._playOffset += _audioContext.currentTime - this._lastPlayStartTime;
    this._audioNode.onended = null;
    this._audioNode.stop();
    this._audioNode.disconnect();
    this._pannerNode.disconnect();
    this._audioNode = new AudioBufferSourceNode(_audioContext);
    this._playState = PlayState.Paused;
    this.emitter.notify(PlayState.Paused);
  }
  /**
   * Resumes the audio associated with this audio src.
   */
  resume() {
    if (this._playState == PlayState.Paused) {
      this.play();
    }
  }
  /**
   * Checks if the audio src is currently playing.
   */
  get isPlaying() {
    return this._playState == PlayState.Playing;
  }
  /**
   * Changes the volume during playback.
   * @param v Volume that source should have.
   * @param t Optional parameter that specifies the time it takes for the volume to reach its specified value in
   * seconds (Default is 0).
   */
  setVolumeDuringPlayback(v, t = 0) {
    const volume = Math.max(MIN_VOLUME, v);
    const time = _audioContext.currentTime + Math.max(MIN_RAMP_TIME, t);
    this._gainNode.gain.linearRampToValueAtTime(volume, time);
  }
  /**
   * Change out the source.
   *
   * @param path Path to the audio file.
   */
  async changeAudioSource(path) {
    this._buffer = await addBufferToCache(path);
    removeBufferFromCache(this.src);
    this.src = path;
  }
  /**
   * Called when the component is deactivated.
   * Stops the audio playback.
   */
  onDeactivate() {
    this.stop();
  }
  /**
   * Called when the component is destroyed.
   * Stops the audio playback and removes the src from cache.
   */
  onDestroy() {
    this.stop();
    this._gainNode.disconnect();
    removeBufferFromCache(this.src);
  }
  _update(dt) {
    this.object.getPositionWorld(posVec);
    this.object.getForwardWorld(oriVec);
    this._time = _audioContext.currentTime + dt;
    this._pannerNode.positionX.linearRampToValueAtTime(posVec[0], this._time);
    this._pannerNode.positionY.linearRampToValueAtTime(posVec[2], this._time);
    this._pannerNode.positionZ.linearRampToValueAtTime(-posVec[1], this._time);
    this._pannerNode.orientationX.linearRampToValueAtTime(oriVec[0], this._time);
    this._pannerNode.orientationY.linearRampToValueAtTime(oriVec[2], this._time);
    this._pannerNode.orientationZ.linearRampToValueAtTime(-oriVec[1], this._time);
  }
  /**
   * @deprecated Use {@link #volume} instead
   */
  set maxVolume(v) {
    this.volume = v;
  }
  /**
   * @deprecated Use {@link #volume} instead
   */
  get maxVolume() {
    return this.volume;
  }
  _updateSettings() {
    this.object.getPositionWorld(posVec);
    this.object.getForwardWorld(oriVec);
    this._pannerOptions = {
      coneInnerAngle: this.coneInnerAngle,
      coneOuterAngle: this.coneOuterAngle,
      coneOuterGain: this.coneOuterGain,
      distanceModel: this._distanceModelSelector(),
      maxDistance: this.maxDistance,
      refDistance: this.refDistance,
      rolloffFactor: this.rolloffFactor,
      panningModel: this.spatial === PanningType.Hrtf ? "HRTF" : "equalpower",
      positionX: posVec[0],
      positionY: posVec[2],
      positionZ: -posVec[1],
      orientationX: oriVec[0],
      orientationY: oriVec[2],
      orientationZ: -oriVec[1]
    };
  }
  _distanceModelSelector() {
    if (distanceModels.includes(this.distanceModel)) {
      return this.distanceModel;
    }
    return "exponential";
  }
};
/**
 * The type name for this component.
 */
__publicField(AudioSource, "TypeName", "audio-source");
__decorate8([
  property.string()
], AudioSource.prototype, "src", void 0);
__decorate8([
  property.float(1)
], AudioSource.prototype, "volume", void 0);
__decorate8([
  property.bool(false)
], AudioSource.prototype, "loop", void 0);
__decorate8([
  property.bool(false)
], AudioSource.prototype, "autoplay", void 0);
__decorate8([
  property.enum(["none", "panning", "hrtf"], PanningType.Regular)
], AudioSource.prototype, "spatial", void 0);
__decorate8([
  property.bool(false)
], AudioSource.prototype, "isStationary", void 0);
__decorate8([
  property.enum(["linear", "inverse", "exponential"], "exponential")
], AudioSource.prototype, "distanceModel", void 0);
__decorate8([
  property.float(1e4)
], AudioSource.prototype, "maxDistance", void 0);
__decorate8([
  property.float(1)
], AudioSource.prototype, "refDistance", void 0);
__decorate8([
  property.float(1)
], AudioSource.prototype, "rolloffFactor", void 0);
__decorate8([
  property.float(360)
], AudioSource.prototype, "coneInnerAngle", void 0);
__decorate8([
  property.float(0)
], AudioSource.prototype, "coneOuterAngle", void 0);
__decorate8([
  property.float(0)
], AudioSource.prototype, "coneOuterGain", void 0);

// node_modules/@wonderlandengine/components/dist/utils/utils.js
function setFirstMaterialTexture(mat, texture, customTextureProperty) {
  if (customTextureProperty !== "auto") {
    mat[customTextureProperty] = texture;
    return true;
  }
  const shader = mat.shader;
  if (shader === "Flat Opaque Textured") {
    mat.flatTexture = texture;
    return true;
  } else if (shader === "Phong Opaque Textured" || shader === "Foliage" || shader === "Phong Normalmapped" || shader === "Phong Lightmapped") {
    mat.diffuseTexture = texture;
    return true;
  } else if (shader === "Particle") {
    mat.mainTexture = texture;
    return true;
  } else if (shader === "DistanceFieldVector") {
    mat.vectorTexture = texture;
    return true;
  } else if (shader === "Background" || shader === "Sky") {
    mat.texture = texture;
    return true;
  } else if (shader === "Physical Opaque Textured") {
    mat.albedoTexture = texture;
    return true;
  }
  return false;
}
function deg2rad(value) {
  return value * Math.PI / 180;
}
function rad2deg(value) {
  return value * 180 / Math.PI;
}

// node_modules/@wonderlandengine/components/dist/image-texture.js
var __decorate9 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImageTexture = class extends Component3 {
  /** URL to download the image from */
  url;
  /** Material to apply the video texture to */
  material;
  /** Name of the texture property to set */
  textureProperty;
  texture;
  start() {
    this.engine.textures.load(this.url, "anonymous").then((texture) => {
      this.texture = texture;
      const mat = this.material;
      if (!setFirstMaterialTexture(mat, texture, this.textureProperty)) {
        console.error("Pipeline", mat.pipeline, "not supported by image-texture");
      }
    }).catch(console.error);
  }
  onDestroy() {
    this.texture?.destroy();
  }
};
__publicField(ImageTexture, "TypeName", "image-texture");
__decorate9([
  property.string()
], ImageTexture.prototype, "url", void 0);
__decorate9([
  property.material({ required: true })
], ImageTexture.prototype, "material", void 0);
__decorate9([
  property.string("auto")
], ImageTexture.prototype, "textureProperty", void 0);

// node_modules/@wonderlandengine/components/dist/mouse-look.js
var __decorate10 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var preventDefault = (e) => {
  e.preventDefault();
};
var TEMP_ROT = new Float32Array(4);
var ROT_MUL = 180 / Math.PI / 100;
var DOWN_EVENT = "pointerdown";
var UP_EVENT = "pointerup";
var MOVE_EVENT = "pointermove";
var MouseLookComponent = class extends Component3 {
  /** Mouse look sensitivity */
  sensitity = 0.25;
  /** Require a mouse button to be pressed to control view.
   * Otherwise view will allways follow mouse movement */
  requireMouseDown = true;
  /** If "moveOnClick" is enabled, mouse button which should
   * be held down to control view */
  mouseButtonIndex = 0;
  /** Enables pointer lock on "mousedown" event on canvas */
  pointerLockOnClick = false;
  currentRotationY = 0;
  currentRotationX = 0;
  mouseDown = false;
  onActivate() {
    document.addEventListener(MOVE_EVENT, this.onMouseMove);
    const canvas2 = this.engine.canvas;
    if (this.pointerLockOnClick) {
      canvas2.addEventListener(DOWN_EVENT, this.requestPointerLock);
    }
    if (this.mouseButtonIndex === 2) {
      canvas2.addEventListener("contextmenu", preventDefault, false);
    }
    canvas2.addEventListener(DOWN_EVENT, this.onMouseDown);
    canvas2.addEventListener(UP_EVENT, this.onMouseUp);
  }
  onDeactivate() {
    document.removeEventListener(MOVE_EVENT, this.onMouseMove);
    const canvas2 = this.engine.canvas;
    if (this.pointerLockOnClick) {
      canvas2.removeEventListener(DOWN_EVENT, this.requestPointerLock);
    }
    if (this.mouseButtonIndex === 2) {
      canvas2.removeEventListener("contextmenu", preventDefault, false);
    }
    canvas2.removeEventListener(DOWN_EVENT, this.onMouseDown);
    canvas2.removeEventListener(UP_EVENT, this.onMouseUp);
  }
  requestPointerLock = () => {
    const canvas2 = this.engine.canvas;
    canvas2.requestPointerLock = canvas2.requestPointerLock || canvas2.mozRequestPointerLock || canvas2.webkitRequestPointerLock;
    canvas2.requestPointerLock();
  };
  onMouseDown = (e) => {
    if (e.button === this.mouseButtonIndex) {
      this.mouseDown = true;
      document.body.style.cursor = "grabbing";
      if (e.button === 1) {
        e.preventDefault();
        return false;
      }
    }
  };
  onMouseUp = (e) => {
    if (e.button === this.mouseButtonIndex) {
      this.mouseDown = false;
      document.body.style.cursor = "initial";
    }
  };
  onMouseMove = (e) => {
    if (this.active && (this.mouseDown || !this.requireMouseDown)) {
      this.currentRotationX += -this.sensitity * e.movementY * ROT_MUL;
      this.currentRotationY += -this.sensitity * e.movementX * ROT_MUL;
      this.currentRotationX = Math.max(-89, Math.min(89, this.currentRotationX));
      quat_exports.fromEuler(TEMP_ROT, this.currentRotationX, this.currentRotationY, 0);
      this.object.setRotationLocal(TEMP_ROT);
    }
  };
};
__publicField(MouseLookComponent, "TypeName", "mouse-look");
__decorate10([
  property.float(0.25)
], MouseLookComponent.prototype, "sensitity", void 0);
__decorate10([
  property.bool(true)
], MouseLookComponent.prototype, "requireMouseDown", void 0);
__decorate10([
  property.int()
], MouseLookComponent.prototype, "mouseButtonIndex", void 0);
__decorate10([
  property.bool(false)
], MouseLookComponent.prototype, "pointerLockOnClick", void 0);

// node_modules/@wonderlandengine/components/dist/player-height.js
var __decorate11 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PlayerHeight = class extends Component3 {
  height = 1.75;
  onSessionStartCallback;
  onSessionEndCallback;
  start() {
    this.object.resetPositionRotation();
    this.object.translateLocal([0, this.height, 0]);
    this.onSessionStartCallback = this.onXRSessionStart.bind(this);
    this.onSessionEndCallback = this.onXRSessionEnd.bind(this);
  }
  onActivate() {
    this.engine.onXRSessionStart.add(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.add(this.onSessionEndCallback);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.remove(this.onSessionEndCallback);
  }
  onXRSessionStart() {
    const type = this.engine.xr?.currentReferenceSpaceType;
    if (type !== "local" && type !== "viewer") {
      this.object.resetPositionRotation();
    }
  }
  onXRSessionEnd() {
    const type = this.engine.xr?.currentReferenceSpaceType;
    if (type !== "local" && type !== "viewer") {
      this.object.resetPositionRotation();
      this.object.translateLocal([0, this.height, 0]);
    }
  }
};
__publicField(PlayerHeight, "TypeName", "player-height");
__decorate11([
  property.float(1.75)
], PlayerHeight.prototype, "height", void 0);

// node_modules/@wonderlandengine/components/dist/target-framerate.js
var __decorate12 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TargetFramerate = class extends Component3 {
  framerate;
  onActivate() {
    this.engine.onXRSessionStart.add(this.setTargetFramerate);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.setTargetFramerate);
  }
  setTargetFramerate = (s) => {
    if (s.supportedFrameRates) {
      const a = s.supportedFrameRates;
      a.sort((a2, b) => Math.abs(a2 - this.framerate) - Math.abs(b - this.framerate));
      s.updateTargetFrameRate(a[0]);
    }
  };
};
__publicField(TargetFramerate, "TypeName", "target-framerate");
__decorate12([
  property.float(90)
], TargetFramerate.prototype, "framerate", void 0);

// node_modules/@wonderlandengine/components/dist/teleport.js
var TeleportComponent = class extends Component3 {
  init() {
    this._prevThumbstickAxis = new Float32Array(2);
    this._tempVec = new Float32Array(3);
    this._tempVec0 = new Float32Array(3);
    this._currentIndicatorRotation = 0;
    this.input = this.object.getComponent("input");
    if (!this.input) {
      console.error(this.object.name, "generic-teleport-component.js: input component is required on the object");
      return;
    }
    if (!this.teleportIndicatorMeshObject) {
      console.error(this.object.name, "generic-teleport-component.js: Teleport indicator mesh is missing");
      return;
    }
    if (!this.camRoot) {
      console.error(this.object.name, "generic-teleport-component.js: camRoot not set");
      return;
    }
    this.isIndicating = false;
    this.indicatorHidden = true;
    this.hitSpot = new Float32Array(3);
    this._hasHit = false;
    this._extraRotation = 0;
    this._currentStickAxes = new Float32Array(2);
  }
  start() {
    if (this.handedness == 0) {
      const inputComp = this.object.getComponent("input");
      if (!inputComp) {
        console.warn("teleport component on object", this.object.name, 'was configured with handedness "input component", but object has no input component.');
      } else {
        this.handedness = inputComp.handedness;
        this.input = inputComp;
      }
    } else {
      this.handedness = ["left", "right"][this.handedness - 1];
    }
    this.onSessionStartCallback = this.setupVREvents.bind(this);
    this.teleportIndicatorMeshObject.active = false;
  }
  onActivate() {
    if (this.cam) {
      this.isMouseIndicating = false;
      canvas.addEventListener("mousedown", this.onMouseDown);
      canvas.addEventListener("mouseup", this.onMouseUp);
    }
    this.engine.onXRSessionStart.add(this.onSessionStartCallback);
  }
  onDeactivate() {
    canvas.removeEventListener("mousedown", this.onMouseDown);
    canvas.removeEventListener("mouseup", this.onMouseUp);
    this.engine.onXRSessionStart.remove(this.onSessionStartCallback);
  }
  /* Get current camera Y rotation */
  _getCamRotation() {
    this.eyeLeft.getForward(this._tempVec);
    this._tempVec[1] = 0;
    vec3_exports.normalize(this._tempVec, this._tempVec);
    return Math.atan2(this._tempVec[0], this._tempVec[2]);
  }
  update() {
    let inputLength = 0;
    if (this.gamepad && this.gamepad.axes) {
      this._currentStickAxes[0] = this.gamepad.axes[2];
      this._currentStickAxes[1] = this.gamepad.axes[3];
      inputLength = Math.abs(this._currentStickAxes[0]) + Math.abs(this._currentStickAxes[1]);
    }
    if (!this.isIndicating && this._prevThumbstickAxis[1] >= this.thumbstickActivationThreshhold && this._currentStickAxes[1] < this.thumbstickActivationThreshhold) {
      this.isIndicating = true;
    } else if (this.isIndicating && inputLength < this.thumbstickDeactivationThreshhold) {
      this.isIndicating = false;
      this.teleportIndicatorMeshObject.active = false;
      if (this._hasHit) {
        this._teleportPlayer(this.hitSpot, this._extraRotation);
      }
    }
    if (this.isIndicating && this.teleportIndicatorMeshObject && this.input) {
      const origin = this._tempVec0;
      this.object.getPositionWorld(origin);
      const direction2 = this.object.getForwardWorld(this._tempVec);
      let rayHit = this.rayHit = this.rayCastMode == 0 ? this.engine.scene.rayCast(origin, direction2, 1 << this.floorGroup) : this.engine.physics.rayCast(origin, direction2, 1 << this.floorGroup, this.maxDistance);
      if (rayHit.hitCount > 0) {
        this.indicatorHidden = false;
        this._extraRotation = Math.PI + Math.atan2(this._currentStickAxes[0], this._currentStickAxes[1]);
        this._currentIndicatorRotation = this._getCamRotation() + (this._extraRotation - Math.PI);
        this.teleportIndicatorMeshObject.resetPositionRotation();
        this.teleportIndicatorMeshObject.rotateAxisAngleRad([0, 1, 0], this._currentIndicatorRotation);
        this.teleportIndicatorMeshObject.translate(rayHit.locations[0]);
        this.teleportIndicatorMeshObject.translate([
          0,
          this.indicatorYOffset,
          0
        ]);
        this.teleportIndicatorMeshObject.active = true;
        this.hitSpot.set(rayHit.locations[0]);
        this._hasHit = true;
      } else {
        if (!this.indicatorHidden) {
          this.teleportIndicatorMeshObject.active = false;
          this.indicatorHidden = true;
        }
        this._hasHit = false;
      }
    } else if (this.teleportIndicatorMeshObject && this.isMouseIndicating) {
      this.onMousePressed();
    }
    this._prevThumbstickAxis.set(this._currentStickAxes);
  }
  setupVREvents(s) {
    this.session = s;
    s.addEventListener("end", function() {
      this.gamepad = null;
      this.session = null;
    }.bind(this));
    if (s.inputSources && s.inputSources.length) {
      for (let i = 0; i < s.inputSources.length; i++) {
        let inputSource = s.inputSources[i];
        if (inputSource.handedness == this.handedness) {
          this.gamepad = inputSource.gamepad;
        }
      }
    }
    s.addEventListener("inputsourceschange", function(e) {
      if (e.added && e.added.length) {
        for (let i = 0; i < e.added.length; i++) {
          let inputSource = e.added[i];
          if (inputSource.handedness == this.handedness) {
            this.gamepad = inputSource.gamepad;
          }
        }
      }
    }.bind(this));
  }
  onMouseDown = () => {
    this.isMouseIndicating = true;
  };
  onMouseUp = () => {
    this.isMouseIndicating = false;
    this.teleportIndicatorMeshObject.active = false;
    if (this._hasHit) {
      this._teleportPlayer(this.hitSpot, 0);
    }
  };
  onMousePressed() {
    let origin = [0, 0, 0];
    this.cam.getPositionWorld(origin);
    const direction2 = this.cam.getForward(this._tempVec);
    let rayHit = this.rayHit = this.rayCastMode == 0 ? this.engine.scene.rayCast(origin, direction2, 1 << this.floorGroup) : this.engine.physics.rayCast(origin, direction2, 1 << this.floorGroup, this.maxDistance);
    if (rayHit.hitCount > 0) {
      this.indicatorHidden = false;
      direction2[1] = 0;
      vec3_exports.normalize(direction2, direction2);
      this._currentIndicatorRotation = -Math.sign(direction2[2]) * Math.acos(direction2[0]) - Math.PI * 0.5;
      this.teleportIndicatorMeshObject.resetPositionRotation();
      this.teleportIndicatorMeshObject.rotateAxisAngleRad([0, 1, 0], this._currentIndicatorRotation);
      this.teleportIndicatorMeshObject.translate(rayHit.locations[0]);
      this.teleportIndicatorMeshObject.active = true;
      this.hitSpot = rayHit.locations[0];
      this._hasHit = true;
    } else {
      if (!this.indicatorHidden) {
        this.teleportIndicatorMeshObject.active = false;
        this.indicatorHidden = true;
      }
      this._hasHit = false;
    }
  }
  _teleportPlayer(newPosition, rotationToAdd) {
    this.camRoot.rotateAxisAngleRad([0, 1, 0], rotationToAdd);
    const p = this._tempVec;
    const p1 = this._tempVec0;
    if (this.session) {
      this.eyeLeft.getPositionWorld(p);
      this.eyeRight.getPositionWorld(p1);
      vec3_exports.add(p, p, p1);
      vec3_exports.scale(p, p, 0.5);
    } else {
      this.cam.getPositionWorld(p);
    }
    this.camRoot.getPositionWorld(p1);
    vec3_exports.sub(p, p1, p);
    p[0] += newPosition[0];
    p[1] = newPosition[1];
    p[2] += newPosition[2];
    this.camRoot.setPositionWorld(p);
  }
};
__publicField(TeleportComponent, "TypeName", "teleport");
__publicField(TeleportComponent, "Properties", {
  /** Object that will be placed as indiciation forwhere the player will teleport to. */
  teleportIndicatorMeshObject: { type: Type.Object },
  /** Root of the player, the object that will be positioned on teleportation. */
  camRoot: { type: Type.Object },
  /** Non-vr camera for use outside of VR */
  cam: { type: Type.Object },
  /** Left eye for use in VR*/
  eyeLeft: { type: Type.Object },
  /** Right eye for use in VR*/
  eyeRight: { type: Type.Object },
  /** Handedness for VR cursors to accept trigger events only from respective controller. */
  handedness: {
    type: Type.Enum,
    values: ["input component", "left", "right", "none"],
    default: "input component"
  },
  /** Collision group of valid "floor" objects that can be teleported on */
  floorGroup: { type: Type.Int, default: 1 },
  /** How far the thumbstick needs to be pushed to have the teleport target indicator show up */
  thumbstickActivationThreshhold: { type: Type.Float, default: -0.7 },
  /** How far the thumbstick needs to be released to execute the teleport */
  thumbstickDeactivationThreshhold: { type: Type.Float, default: 0.3 },
  /** Offset to apply to the indicator object, e.g. to avoid it from Z-fighting with the floor */
  indicatorYOffset: { type: Type.Float, default: 0.01 },
  /** Mode for raycasting, whether to use PhysX or simple collision components */
  rayCastMode: {
    type: Type.Enum,
    values: ["collision", "physx"],
    default: "collision"
  },
  /** Max distance for PhysX raycast */
  maxDistance: { type: Type.Float, default: 100 }
});

// node_modules/@wonderlandengine/components/dist/trail.js
var __decorate13 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var direction = vec3_exports.create();
var offset = vec3_exports.create();
var normal = vec3_exports.create();
var UP = vec3_exports.fromValues(0, 1, 0);
var Trail = class extends Component3 {
  /** The material to apply to the trail mesh */
  material = null;
  /** The number of segments in the trail mesh */
  segments = 50;
  /** The time interval before recording a new point */
  interval = 0.1;
  /** The width of the trail (in world space) */
  width = 1;
  /** Whether or not the trail should taper off */
  taper = true;
  /**
   * The maximum delta time in seconds, above which the trail resets.
   * This prevents the trail from jumping around when updates happen
   * infrequently (e.g. when the tab doesn't have focus).
   */
  resetThreshold = 0.5;
  _currentPointIndex = 0;
  _timeTillNext = 0;
  _points = [];
  _trailContainer = null;
  _meshComp = null;
  _mesh = null;
  _indexData = null;
  start() {
    this._points = new Array(this.segments + 1);
    for (let i = 0; i < this._points.length; ++i) {
      this._points[i] = vec3_exports.create();
    }
    this._timeTillNext = this.interval;
    this._trailContainer = this.engine.scene.addObject();
    this._trailContainer.setDirty();
    this._meshComp = this._trailContainer.addComponent("mesh");
    this._meshComp.material = this.material;
    const vertexCount = 2 * this._points.length;
    this._indexData = new Uint32Array(6 * this.segments);
    for (let i = 0, v = 0; i < vertexCount - 2; i += 2, v += 6) {
      this._indexData.subarray(v, v + 6).set([i + 1, i + 0, i + 2, i + 2, i + 3, i + 1]);
    }
    this._mesh = new Mesh(this.engine, {
      vertexCount,
      indexData: this._indexData,
      indexType: MeshIndexType.UnsignedInt
    });
    this._meshComp.mesh = this._mesh;
  }
  updateVertices() {
    if (!this._mesh)
      return;
    const positions = this._mesh.attribute(MeshAttribute.Position);
    const texCoords = this._mesh.attribute(MeshAttribute.TextureCoordinate);
    const normals = this._mesh.attribute(MeshAttribute.Normal);
    vec3_exports.set(direction, 0, 0, 0);
    for (let i = 0; i < this._points.length; ++i) {
      const curr = this._points[(this._currentPointIndex + i + 1) % this._points.length];
      const next = this._points[(this._currentPointIndex + i + 2) % this._points.length];
      if (i !== this._points.length - 1) {
        vec3_exports.sub(direction, next, curr);
      }
      vec3_exports.cross(offset, UP, direction);
      vec3_exports.normalize(offset, offset);
      const timeFraction = 1 - this._timeTillNext / this.interval;
      const fraction = (i - timeFraction) / this.segments;
      vec3_exports.scale(offset, offset, (this.taper ? fraction : 1) * this.width / 2);
      positions.set(i * 2, [
        curr[0] - offset[0],
        curr[1] - offset[1],
        curr[2] - offset[2]
      ]);
      positions.set(i * 2 + 1, [
        curr[0] + offset[0],
        curr[1] + offset[1],
        curr[2] + offset[2]
      ]);
      if (normals) {
        vec3_exports.cross(normal, direction, offset);
        vec3_exports.normalize(normal, normal);
        normals.set(i * 2, normal);
        normals.set(i * 2 + 1, normal);
      }
      if (texCoords) {
        texCoords.set(i * 2, [0, fraction]);
        texCoords.set(i * 2 + 1, [1, fraction]);
      }
    }
    this._mesh.update();
  }
  resetTrail() {
    this.object.getPositionWorld(this._points[0]);
    for (let i = 1; i < this._points.length; ++i) {
      vec3_exports.copy(this._points[i], this._points[0]);
    }
    this._currentPointIndex = 0;
    this._timeTillNext = this.interval;
  }
  update(dt) {
    this._timeTillNext -= dt;
    if (dt > this.resetThreshold) {
      this.resetTrail();
    }
    if (this._timeTillNext < 0) {
      this._currentPointIndex = (this._currentPointIndex + 1) % this._points.length;
      this._timeTillNext = this._timeTillNext % this.interval + this.interval;
    }
    this.object.getPositionWorld(this._points[this._currentPointIndex]);
    this.updateVertices();
  }
  onActivate() {
    this.resetTrail();
    if (this._meshComp)
      this._meshComp.active = true;
  }
  onDeactivate() {
    if (this._meshComp)
      this._meshComp.active = false;
  }
  onDestroy() {
    if (this._trailContainer)
      this._trailContainer.destroy();
    if (this._mesh)
      this._mesh.destroy();
  }
};
__publicField(Trail, "TypeName", "trail");
__decorate13([
  property.material()
], Trail.prototype, "material", void 0);
__decorate13([
  property.int(50)
], Trail.prototype, "segments", void 0);
__decorate13([
  property.float(0.1)
], Trail.prototype, "interval", void 0);
__decorate13([
  property.float(1)
], Trail.prototype, "width", void 0);
__decorate13([
  property.bool(true)
], Trail.prototype, "taper", void 0);
__decorate13([
  property.float(1)
], Trail.prototype, "resetThreshold", void 0);

// node_modules/@wonderlandengine/components/dist/two-joint-ik-solver.js
function clamp2(v, a, b) {
  return Math.max(a, Math.min(v, b));
}
var rootScaling = new Float32Array(3);
var tempQuat3 = new Float32Array(4);
var twoJointIK = function() {
  const ta = new Float32Array(3);
  const ca = new Float32Array(3);
  const ba = new Float32Array(3);
  const ab = new Float32Array(3);
  const cb = new Float32Array(3);
  const axis0 = new Float32Array(3);
  const axis1 = new Float32Array(3);
  const temp = new Float32Array(3);
  return function(root, middle, b, c, targetPos, eps, helper) {
    ba.set(b);
    const lab = vec3_exports.length(ba);
    vec3_exports.sub(ta, b, c);
    const lcb = vec3_exports.length(ta);
    ta.set(targetPos);
    const lat = clamp2(vec3_exports.length(ta), eps, lab + lcb - eps);
    ca.set(c);
    vec3_exports.scale(ab, b, -1);
    vec3_exports.sub(cb, c, b);
    vec3_exports.normalize(ca, ca);
    vec3_exports.normalize(ba, ba);
    vec3_exports.normalize(ab, ab);
    vec3_exports.normalize(cb, cb);
    vec3_exports.normalize(ta, ta);
    const ac_ab_0 = Math.acos(clamp2(vec3_exports.dot(ca, ba), -1, 1));
    const ba_bc_0 = Math.acos(clamp2(vec3_exports.dot(ab, cb), -1, 1));
    const ac_at_0 = Math.acos(clamp2(vec3_exports.dot(ca, ta), -1, 1));
    const ac_ab_1 = Math.acos(clamp2((lcb * lcb - lab * lab - lat * lat) / (-2 * lab * lat), -1, 1));
    const ba_bc_1 = Math.acos(clamp2((lat * lat - lab * lab - lcb * lcb) / (-2 * lab * lcb), -1, 1));
    if (helper) {
      vec3_exports.sub(ba, helper, b);
      vec3_exports.normalize(ba, ba);
    }
    vec3_exports.cross(axis0, ca, ba);
    vec3_exports.normalize(axis0, axis0);
    vec3_exports.cross(axis1, c, targetPos);
    vec3_exports.normalize(axis1, axis1);
    middle.transformVectorInverseLocal(temp, axis0);
    root.rotateAxisAngleRadObject(axis1, ac_at_0);
    root.rotateAxisAngleRadObject(axis0, ac_ab_1 - ac_ab_0);
    middle.rotateAxisAngleRadObject(axis0, ba_bc_1 - ba_bc_0);
  };
}();
var TwoJointIkSolver = class extends Component3 {
  time = 0;
  middlePos = new Float32Array(3);
  endPos = new Float32Array(3);
  targetPos = new Float32Array(3);
  helperPos = new Float32Array(3);
  rootTransform = new Float32Array(8);
  middleTransform = new Float32Array(8);
  endTransform = new Float32Array(8);
  start() {
    this.root.getTransformLocal(this.rootTransform);
    this.middle.getTransformLocal(this.middleTransform);
    this.end.getTransformLocal(this.endTransform);
  }
  update(dt) {
    this.time += dt;
    this.root.setTransformLocal(this.rootTransform);
    this.middle.setTransformLocal(this.middleTransform);
    this.end.setTransformLocal(this.endTransform);
    this.root.getScalingWorld(rootScaling);
    this.middle.getPositionLocal(this.middlePos);
    this.end.getPositionLocal(this.endPos);
    this.middle.transformPointLocal(this.endPos, this.endPos);
    if (this.helper) {
      this.helper.getPositionWorld(this.helperPos);
      this.root.transformPointInverseWorld(this.helperPos, this.helperPos);
      vec3_exports.div(this.helperPos, this.helperPos, rootScaling);
    }
    this.target.getPositionWorld(this.targetPos);
    this.root.transformPointInverseWorld(this.targetPos, this.targetPos);
    vec3_exports.div(this.targetPos, this.targetPos, rootScaling);
    twoJointIK(this.root, this.middle, this.middlePos, this.endPos, this.targetPos, 0.01, this.helper ? this.helperPos : null, this.time);
    if (this.copyTargetRotation) {
      this.end.setRotationWorld(this.target.getRotationWorld(tempQuat3));
    }
  }
};
__publicField(TwoJointIkSolver, "TypeName", "two-joint-ik-solver");
__publicField(TwoJointIkSolver, "Properties", {
  /** Root bone, never moves */
  root: Property.object(),
  /** Bone attached to the root */
  middle: Property.object(),
  /** Bone attached to the middle */
  end: Property.object(),
  /** Target the joins should reach for */
  target: Property.object(),
  /** Flag for copying rotation from target to end */
  copyTargetRotation: Property.bool(true),
  /** Helper object to use to determine joint rotation axis */
  helper: Property.object()
});

// node_modules/@wonderlandengine/components/dist/video-texture.js
var __decorate14 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VideoTexture = class extends Component3 {
  /** URL to download video from */
  url;
  /** Material to apply the video texture to */
  material;
  /** Whether to loop the video */
  loop;
  /** Whether to automatically start playing the video */
  autoplay;
  /** Whether to mute sound */
  muted;
  /** Name of the texture property to set */
  textureProperty;
  loaded = false;
  frameUpdateRequested = true;
  video;
  texture;
  start() {
    this.video = document.createElement("video");
    this.video.src = this.url;
    this.video.crossOrigin = "anonymous";
    this.video.playsInline = true;
    this.video.loop = this.loop;
    this.video.muted = this.muted;
    this.video.addEventListener("playing", () => {
      this.loaded = true;
    });
    if (this.autoplay) {
      if (this.muted) {
        this.video?.play();
      } else {
        window.addEventListener("click", this.playAfterUserGesture);
        window.addEventListener("touchstart", this.playAfterUserGesture);
      }
    }
  }
  onDestroy() {
    this.video?.remove();
    this.texture?.destroy();
    if (this.autoplay && !this.muted) {
      window.removeEventListener("click", this.playAfterUserGesture);
      window.removeEventListener("touchstart", this.playAfterUserGesture);
    }
  }
  applyTexture() {
    const mat = this.material;
    const pipeline = mat.pipeline;
    const texture = this.texture = this.engine.textures.create(this.video);
    if (!setFirstMaterialTexture(mat, texture, this.textureProperty)) {
      console.error("Pipeline", pipeline, "not supported by video-texture");
    }
    if ("requestVideoFrameCallback" in this.video) {
      this.video.requestVideoFrameCallback(this.updateVideo.bind(this));
    } else {
      this.video.addEventListener("timeupdate", () => {
        this.frameUpdateRequested = true;
      });
    }
  }
  update(dt) {
    if (this.loaded && this.frameUpdateRequested) {
      if (this.texture) {
        this.texture.update();
      } else {
        this.applyTexture();
      }
      this.frameUpdateRequested = false;
    }
  }
  updateVideo() {
    this.frameUpdateRequested = true;
    this.video.requestVideoFrameCallback(this.updateVideo.bind(this));
  }
  playAfterUserGesture = () => {
    this.video?.play();
    window.removeEventListener("click", this.playAfterUserGesture);
    window.removeEventListener("touchstart", this.playAfterUserGesture);
  };
};
__publicField(VideoTexture, "TypeName", "video-texture");
__decorate14([
  property.string()
], VideoTexture.prototype, "url", void 0);
__decorate14([
  property.material({ required: true })
], VideoTexture.prototype, "material", void 0);
__decorate14([
  property.bool(true)
], VideoTexture.prototype, "loop", void 0);
__decorate14([
  property.bool(true)
], VideoTexture.prototype, "autoplay", void 0);
__decorate14([
  property.bool(true)
], VideoTexture.prototype, "muted", void 0);
__decorate14([
  property.string("auto")
], VideoTexture.prototype, "textureProperty", void 0);

// node_modules/@wonderlandengine/components/dist/vr-mode-active-switch.js
var VrModeActiveSwitch = class extends Component3 {
  start() {
    this.components = [];
    this.getComponents(this.object);
    this.onXRSessionEnd();
    this.onSessionStartCallback = this.onXRSessionStart.bind(this);
    this.onSessionEndCallback = this.onXRSessionEnd.bind(this);
  }
  onActivate() {
    this.engine.onXRSessionStart.add(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.add(this.onSessionEndCallback);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.remove(this.onSessionEndCallback);
  }
  getComponents(obj) {
    const comps = obj.getComponents().filter((c) => c.type !== "vr-mode-active-switch");
    this.components = this.components.concat(comps);
    if (this.affectChildren) {
      let children = obj.children;
      for (let i = 0; i < children.length; ++i) {
        this.getComponents(children[i]);
      }
    }
  }
  setComponentsActive(active) {
    const comps = this.components;
    for (let i = 0; i < comps.length; ++i) {
      comps[i].active = active;
    }
  }
  onXRSessionStart() {
    this.setComponentsActive(this.activateComponents == 0);
  }
  onXRSessionEnd() {
    this.setComponentsActive(this.activateComponents != 0);
  }
};
__publicField(VrModeActiveSwitch, "TypeName", "vr-mode-active-switch");
__publicField(VrModeActiveSwitch, "Properties", {
  /** When components should be active: In VR or when not in VR */
  activateComponents: {
    type: Type.Enum,
    values: ["in VR", "in non-VR"],
    default: "in VR"
  },
  /** Whether child object's components should be affected */
  affectChildren: { type: Type.Bool, default: true }
});

// node_modules/@wonderlandengine/components/dist/plane-detection.js
var import_earcut = __toESM(require_earcut(), 1);
var __decorate15 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var tempVec32 = new Float32Array(3);
function extentsFromContour(out, points) {
  if (points.length == 0)
    return out;
  let absMaxX = Math.abs(points[0].x);
  let absMaxZ = Math.abs(points[0].z);
  for (let i = 1; i < points.length; ++i) {
    absMaxX = Math.max(absMaxX, Math.abs(points[i].x));
    absMaxZ = Math.max(absMaxZ, Math.abs(points[i].z));
  }
  out[0] = absMaxX;
  out[1] = 0;
  out[2] = absMaxZ;
}
function planeMeshFromContour(engine2, points, meshToUpdate = null) {
  const vertexCount = points.length;
  const vertices = new Float32Array(vertexCount * 2);
  for (let i = 0, d = 0; i < vertexCount; ++i, d += 2) {
    vertices[d] = points[i].x;
    vertices[d + 1] = points[i].z;
  }
  const triangles = (0, import_earcut.default)(vertices);
  const mesh = meshToUpdate || new Mesh(engine2, {
    vertexCount,
    /* Assumption here that we will never have more than 256 points
     * in the detected plane meshes! */
    indexType: MeshIndexType.UnsignedByte,
    indexData: triangles
  });
  if (mesh.vertexCount !== vertexCount) {
    console.warn("vertexCount of meshToUpdate did not match required vertexCount");
    return mesh;
  }
  const positions = mesh.attribute(MeshAttribute.Position);
  const textureCoords = mesh.attribute(MeshAttribute.TextureCoordinate);
  const normals = mesh.attribute(MeshAttribute.Normal);
  tempVec32[1] = 0;
  for (let i = 0, s = 0; i < vertexCount; ++i, s += 2) {
    tempVec32[0] = vertices[s];
    tempVec32[2] = vertices[s + 1];
    positions.set(i, tempVec32);
  }
  textureCoords?.set(0, vertices);
  if (normals) {
    tempVec32[0] = 0;
    tempVec32[1] = 1;
    tempVec32[2] = 0;
    for (let i = 0; i < vertexCount; ++i) {
      normals.set(i, tempVec32);
    }
  }
  if (meshToUpdate)
    mesh.update();
  return mesh;
}
var _planeLost, planeLost_fn, _planeFound, planeFound_fn, _planeUpdate, planeUpdate_fn, _planeUpdatePose, planeUpdatePose_fn;
var PlaneDetection = class extends Component3 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _planeLost);
    __privateAdd(this, _planeFound);
    __privateAdd(this, _planeUpdate);
    __privateAdd(this, _planeUpdatePose);
    /**
     * Material to assign to created plane meshes or `null` if meshes should not be created.
     */
    __publicField(this, "planeMaterial", null);
    /**
     * Collision mask to assign to newly created collision components or a negative value if
     * collision components should not be created.
     */
    __publicField(this, "collisionMask", -1);
    /** Map of all planes and their last updated timestamps */
    __publicField(this, "planes", /* @__PURE__ */ new Map());
    /** Objects generated for each XRPlane */
    __publicField(this, "planeObjects", /* @__PURE__ */ new Map());
    /** Called when a plane starts tracking */
    __publicField(this, "onPlaneFound", new Emitter());
    /** Called when a plane stops tracking */
    __publicField(this, "onPlaneLost", new Emitter());
  }
  update() {
    if (!this.engine.xr?.frame)
      return;
    if (this.engine.xr.frame.detectedPlanes === void 0) {
      console.error("plane-detection: WebXR feature not available.");
      this.active = false;
      return;
    }
    const detectedPlanes = this.engine.xr.frame.detectedPlanes;
    for (const [plane, _] of this.planes) {
      if (!detectedPlanes.has(plane)) {
        __privateMethod(this, _planeLost, planeLost_fn).call(this, plane);
      }
    }
    detectedPlanes.forEach((plane) => {
      if (this.planes.has(plane)) {
        if (plane.lastChangedTime > this.planes.get(plane)) {
          __privateMethod(this, _planeUpdate, planeUpdate_fn).call(this, plane);
        }
      } else {
        __privateMethod(this, _planeFound, planeFound_fn).call(this, plane);
      }
      __privateMethod(this, _planeUpdatePose, planeUpdatePose_fn).call(this, plane);
    });
  }
};
_planeLost = new WeakSet();
planeLost_fn = function(plane) {
  this.planes.delete(plane);
  const o = this.planeObjects.get(plane);
  this.onPlaneLost.notify(plane, o);
  if (o.objectId > 0)
    o.destroy();
};
_planeFound = new WeakSet();
planeFound_fn = function(plane) {
  this.planes.set(plane, plane.lastChangedTime);
  const o = this.engine.scene.addObject(this.object);
  this.planeObjects.set(plane, o);
  if (this.planeMaterial) {
    o.addComponent(MeshComponent, {
      mesh: planeMeshFromContour(this.engine, plane.polygon),
      material: this.planeMaterial
    });
  }
  if (this.collisionMask >= 0) {
    extentsFromContour(tempVec32, plane.polygon);
    tempVec32[1] = 0.025;
    o.addComponent(CollisionComponent, {
      group: this.collisionMask,
      collider: Collider.Box,
      extents: tempVec32
    });
  }
  this.onPlaneFound.notify(plane, o);
};
_planeUpdate = new WeakSet();
planeUpdate_fn = function(plane) {
  this.planes.set(plane, plane.lastChangedTime);
  const planeMesh = this.planeObjects.get(plane).getComponent(MeshComponent);
  if (!planeMesh)
    return;
  planeMeshFromContour(this.engine, plane.polygon, planeMesh.mesh);
};
_planeUpdatePose = new WeakSet();
planeUpdatePose_fn = function(plane) {
  const o = this.planeObjects.get(plane);
  const pose = this.engine.xr.frame.getPose(plane.planeSpace, this.engine.xr.currentReferenceSpace);
  if (!pose) {
    o.active = false;
    return;
  }
  setXRRigidTransformLocal(o, pose.transform);
};
__publicField(PlaneDetection, "TypeName", "plane-detection");
__decorate15([
  property.material()
], PlaneDetection.prototype, "planeMaterial", void 0);
__decorate15([
  property.int()
], PlaneDetection.prototype, "collisionMask", void 0);

// node_modules/@wonderlandengine/components/dist/vrm.js
var __decorate16 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VRM_ROLL_AXES = {
  X: [1, 0, 0],
  Y: [0, 1, 0],
  Z: [0, 0, 1]
};
var VRM_AIM_AXES = {
  PositiveX: [1, 0, 0],
  NegativeX: [-1, 0, 0],
  PositiveY: [0, 1, 0],
  NegativeY: [0, -1, 0],
  PositiveZ: [0, 0, 1],
  NegativeZ: [0, 0, -1]
};
var Rad2Deg = 180 / Math.PI;
var RightVector = vec3_exports.fromValues(1, 0, 0);
var UpVector = vec3_exports.fromValues(0, 1, 0);
var ForwardVector = vec3_exports.fromValues(0, 0, 1);
var Vrm = class extends Component3 {
  /** URL to a VRM file to load */
  src;
  /** Object the VRM is looking at */
  lookAtTarget;
  /** Meta information about the VRM model */
  meta = null;
  /** The humanoid bones of the VRM model */
  bones = {
    /* Torso */
    hips: null,
    spine: null,
    chest: null,
    upperChest: null,
    neck: null,
    /* Head */
    head: null,
    leftEye: null,
    rightEye: null,
    jaw: null,
    /* Legs */
    leftUpperLeg: null,
    leftLowerLeg: null,
    leftFoot: null,
    leftToes: null,
    rightUpperLeg: null,
    rightLowerLeg: null,
    rightFoot: null,
    rightToes: null,
    /* Arms */
    leftShoulder: null,
    leftUpperArm: null,
    leftLowerArm: null,
    leftHand: null,
    rightShoulder: null,
    rightUpperArm: null,
    rightLowerArm: null,
    rightHand: null,
    /* Fingers */
    leftThumbMetacarpal: null,
    leftThumbProximal: null,
    leftThumbDistal: null,
    leftIndexProximal: null,
    leftIndexIntermediate: null,
    leftIndexDistal: null,
    leftMiddleProximal: null,
    leftMiddleIntermediate: null,
    leftMiddleDistal: null,
    leftRingProximal: null,
    leftRingIntermediate: null,
    leftRingDistal: null,
    leftLittleProximal: null,
    leftLittleIntermediate: null,
    leftLittleDistal: null,
    rightThumbMetacarpal: null,
    rightThumbProximal: null,
    rightThumbDistal: null,
    rightIndexProximal: null,
    rightIndexIntermediate: null,
    rightIndexDistal: null,
    rightMiddleProximal: null,
    rightMiddleIntermediate: null,
    rightMiddleDistal: null,
    rightRingProximal: null,
    rightRingIntermediate: null,
    rightRingDistal: null,
    rightLittleProximal: null,
    rightLittleIntermediate: null,
    rightLittleDistal: null
  };
  /** Rotations of the bones in the rest pose (T-pose) */
  restPose = {};
  /* All node constraints, ordered to deal with dependencies */
  _nodeConstraints = [];
  /* VRMC_springBone chains */
  _springChains = [];
  /* Spherical colliders for spring bones */
  _sphereColliders = [];
  /* Capsule shaped colliders for spring bones */
  _capsuleColliders = [];
  /* Indicates which meshes are rendered in first/third person views */
  _firstPersonAnnotations = [];
  /* Contains details for (bone type) lookAt behaviour */
  _lookAt = null;
  /* Whether or not the VRM component has been initialized with `initializeVrm` */
  _initialized = false;
  _tempV3 = vec3_exports.create();
  _tempV3A = vec3_exports.create();
  _tempV3B = vec3_exports.create();
  _tempQuat = quat_exports.create();
  _tempQuatA = quat_exports.create();
  _tempQuatB = quat_exports.create();
  _tempQuat2 = quat2_exports.create();
  _tailToShape = vec3_exports.create();
  _headToTail = vec3_exports.create();
  _inertia = vec3_exports.create();
  _stiffness = vec3_exports.create();
  _external = vec3_exports.create();
  _identityQuat = quat_exports.identity(quat_exports.create());
  async start() {
    if (!this.src) {
      console.error("vrm: src property not set");
      return;
    }
    const prefab = await this.engine.loadGLTF({ url: this.src, extensions: true });
    const { root, extensions } = this.engine.scene.instantiate(prefab);
    root.children.forEach((child) => child.parent = this.object);
    this._initializeVrm(prefab.extensions, extensions?.idMapping);
    root.destroy();
  }
  /**
   * Parses the VRM glTF extensions and initializes the vrm component.
   * @param extensions The glTF extensions for the VRM model
   */
  _initializeVrm(extensions, idMapping) {
    if (this._initialized) {
      throw new Error("VRM component has already been initialized");
    }
    const VRMC_vrm = extensions.root["VRMC_vrm"];
    if (!VRMC_vrm) {
      throw new Error("Missing VRM extensions");
    }
    if (VRMC_vrm.specVersion !== "1.0") {
      throw new Error(`Unsupported VRM version, only 1.0 is supported, but encountered '${VRMC_vrm.specVersion}'`);
    }
    this.meta = VRMC_vrm.meta;
    this._parseHumanoid(VRMC_vrm.humanoid, idMapping);
    if (VRMC_vrm.firstPerson) {
      this._parseFirstPerson(VRMC_vrm.firstPerson, extensions);
    }
    if (VRMC_vrm.lookAt) {
      this._parseLookAt(VRMC_vrm.lookAt);
    }
    this._findAndParseNodeConstraints(extensions, idMapping);
    const springBone = extensions.root["VRMC_springBone"];
    if (springBone) {
      this._parseAndInitializeSpringBones(springBone, idMapping);
    }
    this._initialized = true;
  }
  _parseHumanoid(humanoid, idMapping) {
    for (const boneName in humanoid.humanBones) {
      if (!(boneName in this.bones)) {
        console.warn(`Unrecognized bone '${boneName}'`);
        continue;
      }
      const node = humanoid.humanBones[boneName].node;
      const objectId = idMapping[node];
      this.bones[boneName] = this.engine.scene.wrap(objectId);
      this.restPose[boneName] = this.bones[boneName].getRotationLocal(quat_exports.create());
    }
  }
  _parseFirstPerson(firstPerson, idMapping) {
    for (const meshAnnotation of firstPerson.meshAnnotations) {
      const annotation = {
        node: this.engine.scene.wrap(idMapping[meshAnnotation.node]),
        firstPerson: true,
        thirdPerson: true
      };
      switch (meshAnnotation.type) {
        case "firstPersonOnly":
          annotation.thirdPerson = false;
          break;
        case "thirdPersonOnly":
          annotation.firstPerson = false;
          break;
        case "both":
          break;
        case "auto":
          console.warn("First person mesh annotation type 'auto' is not supported, treating as 'both'!");
          break;
        default:
          console.error(`Invalid mesh annotation type '${meshAnnotation.type}'`);
          break;
      }
      this._firstPersonAnnotations.push(annotation);
    }
  }
  _parseLookAt(lookAt2) {
    if (lookAt2.type !== "bone") {
      console.warn(`Unsupported lookAt type '${lookAt2.type}', only 'bone' is supported`);
      return;
    }
    const parseRangeMap = (rangeMap) => {
      return {
        inputMaxValue: rangeMap.inputMaxValue,
        outputScale: rangeMap.outputScale
      };
    };
    this._lookAt = {
      offsetFromHeadBone: lookAt2.offsetFromHeadBone || [0, 0, 0],
      horizontalInner: parseRangeMap(lookAt2.rangeMapHorizontalInner),
      horizontalOuter: parseRangeMap(lookAt2.rangeMapHorizontalOuter),
      verticalDown: parseRangeMap(lookAt2.rangeMapVerticalDown),
      verticalUp: parseRangeMap(lookAt2.rangeMapVerticalUp)
    };
  }
  _findAndParseNodeConstraints(extensions, idMapping) {
    const traverse = (object) => {
      const nodeExtensions = extensions.node[object.objectId];
      if (nodeExtensions && "VRMC_node_constraint" in nodeExtensions) {
        const nodeConstraintExtension = nodeExtensions["VRMC_node_constraint"];
        const constraint = nodeConstraintExtension.constraint;
        let type, axis;
        if ("roll" in constraint) {
          type = "roll";
          axis = VRM_ROLL_AXES[constraint.roll.rollAxis];
        } else if ("aim" in constraint) {
          type = "aim";
          axis = VRM_AIM_AXES[constraint.aim.aimAxis];
        } else if ("rotation" in constraint) {
          type = "rotation";
        }
        if (type) {
          const source = this.engine.scene.wrap(idMapping[constraint[type].source]);
          this._nodeConstraints.push({
            type,
            source,
            destination: object,
            axis,
            weight: constraint[type].weight,
            /* Rest pose */
            destinationRestLocalRotation: object.getRotationLocal(quat_exports.create()),
            sourceRestLocalRotation: source.getRotationLocal(quat_exports.create()),
            sourceRestLocalRotationInv: quat_exports.invert(quat_exports.create(), source.getRotationLocal(this._tempQuat))
          });
        } else {
          console.warn("Unrecognized or invalid VRMC_node_constraint, ignoring it");
        }
      }
      for (const child of object.children) {
        traverse(child);
      }
    };
    traverse(this.object);
  }
  _parseAndInitializeSpringBones(springBone, idMapping) {
    const colliders = (springBone.colliders || []).map((collider, i) => {
      const shapeType = "capsule" in collider.shape ? "capsule" : "sphere";
      return {
        id: i,
        object: this.engine.scene.wrap(idMapping[collider.node]),
        shape: {
          isCapsule: shapeType === "capsule",
          radius: collider.shape[shapeType].radius,
          offset: collider.shape[shapeType].offset,
          tail: collider.shape[shapeType].tail
        },
        cache: {
          head: vec3_exports.create(),
          tail: vec3_exports.create()
        }
      };
    });
    this._sphereColliders = colliders.filter((c) => !c.shape.isCapsule);
    this._capsuleColliders = colliders.filter((c) => c.shape.isCapsule);
    const colliderGroups = (springBone.colliderGroups || []).map((group) => ({
      name: group.name,
      colliders: group.colliders.map((c) => colliders[c])
    }));
    for (const spring of springBone.springs) {
      const joints = [];
      for (const joint of spring.joints) {
        const springJoint = {
          hitRadius: 0,
          stiffness: 1,
          gravityPower: 0,
          gravityDir: [0, -1, 0],
          dragForce: 0.5,
          node: null,
          state: null
        };
        Object.assign(springJoint, joint);
        springJoint.node = this.engine.scene.wrap(idMapping[joint.node]);
        joints.push(springJoint);
      }
      const springChainColliders = (spring.colliderGroups || []).flatMap((cg) => colliderGroups[cg].colliders);
      this._springChains.push({
        name: spring.name,
        center: spring.center ? this.engine.scene.wrap(idMapping[spring.center]) : null,
        joints,
        sphereColliders: springChainColliders.filter((c) => !c.shape.isCapsule),
        capsuleColliders: springChainColliders.filter((c) => c.shape.isCapsule)
      });
    }
    for (const springChain of this._springChains) {
      for (let i = 0; i < springChain.joints.length - 1; ++i) {
        const springBoneJoint = springChain.joints[i];
        const childSpringBoneJoint = springChain.joints[i + 1];
        const springBonePosition = springBoneJoint.node.getPositionWorld(vec3_exports.create());
        const childSpringBonePosition = childSpringBoneJoint.node.getPositionWorld(vec3_exports.create());
        const boneDirection = vec3_exports.subtract(this._tempV3A, springBonePosition, childSpringBonePosition);
        const state = {
          prevTail: vec3_exports.copy(vec3_exports.create(), childSpringBonePosition),
          currentTail: vec3_exports.copy(vec3_exports.create(), childSpringBonePosition),
          initialLocalRotation: springBoneJoint.node.getRotationLocal(quat_exports.create()),
          initialLocalTransformInvert: quat2_exports.invert(quat2_exports.create(), springBoneJoint.node.getTransformLocal(this._tempQuat2)),
          boneAxis: vec3_exports.normalize(vec3_exports.create(), childSpringBoneJoint.node.getPositionLocal(this._tempV3)),
          /* Ensure bone length is at least 1cm to avoid jittery behaviour from zero-length bones */
          boneLength: Math.max(0.01, vec3_exports.length(boneDirection)),
          /* Tail positions in center space, if needed */
          prevTailCenter: null,
          currentTailCenter: null
        };
        if (springChain.center) {
          state.prevTailCenter = springChain.center.transformPointInverseWorld(vec3_exports.create(), childSpringBonePosition);
          state.currentTailCenter = vec3_exports.copy(vec3_exports.create(), childSpringBonePosition);
        }
        springBoneJoint.state = state;
      }
    }
  }
  update(dt) {
    if (!this._initialized) {
      return;
    }
    this._resolveLookAt();
    this._resolveConstraints();
    this._updateSpringBones(dt);
  }
  _rangeMap(rangeMap, input) {
    const maxValue = rangeMap.inputMaxValue;
    const outputScale = rangeMap.outputScale;
    return Math.min(input, maxValue) / maxValue * outputScale;
  }
  _resolveLookAt() {
    if (!this._lookAt || !this.lookAtTarget) {
      return;
    }
    const lookAtSource = this.bones.head.transformPointWorld(this._tempV3A, this._lookAt.offsetFromHeadBone);
    const lookAtTarget = this.lookAtTarget.getPositionWorld(this._tempV3B);
    const lookAtDirection = vec3_exports.sub(this._tempV3A, lookAtTarget, lookAtSource);
    vec3_exports.normalize(lookAtDirection, lookAtDirection);
    this.bones.head.parent.transformVectorInverseWorld(lookAtDirection);
    const z = vec3_exports.dot(lookAtDirection, ForwardVector);
    const x = vec3_exports.dot(lookAtDirection, RightVector);
    const yaw = Math.atan2(x, z) * Rad2Deg;
    const xz = Math.sqrt(x * x + z * z);
    const y = vec3_exports.dot(lookAtDirection, UpVector);
    let pitch = Math.atan2(-y, xz) * Rad2Deg;
    if (pitch > 0) {
      pitch = this._rangeMap(this._lookAt.verticalDown, pitch);
    } else {
      pitch = -this._rangeMap(this._lookAt.verticalUp, -pitch);
    }
    if (this.bones.leftEye) {
      let yawLeft = yaw;
      if (yawLeft > 0) {
        yawLeft = this._rangeMap(this._lookAt.horizontalInner, yawLeft);
      } else {
        yawLeft = -this._rangeMap(this._lookAt.horizontalOuter, -yawLeft);
      }
      const eyeRotation = quat_exports.fromEuler(this._tempQuatA, pitch, yawLeft, 0);
      this.bones.leftEye.setRotationLocal(quat_exports.multiply(eyeRotation, this.restPose.leftEye, eyeRotation));
    }
    if (this.bones.rightEye) {
      let yawRight = yaw;
      if (yawRight > 0) {
        yawRight = this._rangeMap(this._lookAt.horizontalOuter, yawRight);
      } else {
        yawRight = -this._rangeMap(this._lookAt.horizontalInner, -yawRight);
      }
      const eyeRotation = quat_exports.fromEuler(this._tempQuatA, pitch, yawRight, 0);
      this.bones.rightEye.setRotationLocal(quat_exports.multiply(eyeRotation, this.restPose.rightEye, eyeRotation));
    }
  }
  _resolveConstraints() {
    for (const nodeConstraint of this._nodeConstraints) {
      this._resolveConstraint(nodeConstraint);
    }
  }
  _resolveConstraint(nodeConstraint) {
    const dstRestQuat = nodeConstraint.destinationRestLocalRotation;
    const srcRestQuatInv = nodeConstraint.sourceRestLocalRotationInv;
    const targetQuat = quat_exports.identity(this._tempQuatA);
    switch (nodeConstraint.type) {
      case "roll":
        {
          const deltaSrcQuat = quat_exports.multiply(this._tempQuatA, srcRestQuatInv, nodeConstraint.source.rotationLocal);
          const deltaSrcQuatInParent = quat_exports.multiply(this._tempQuatA, nodeConstraint.sourceRestLocalRotation, deltaSrcQuat);
          quat_exports.mul(deltaSrcQuatInParent, deltaSrcQuatInParent, srcRestQuatInv);
          const dstRestQuatInv = quat_exports.invert(this._tempQuatB, dstRestQuat);
          const deltaSrcQuatInDst = quat_exports.multiply(this._tempQuatB, dstRestQuatInv, deltaSrcQuatInParent);
          quat_exports.multiply(deltaSrcQuatInDst, deltaSrcQuatInDst, dstRestQuat);
          const toVec = vec3_exports.transformQuat(this._tempV3A, nodeConstraint.axis, deltaSrcQuatInDst);
          const fromToQuat = quat_exports.rotationTo(this._tempQuatA, nodeConstraint.axis, toVec);
          quat_exports.mul(targetQuat, dstRestQuat, quat_exports.invert(this._tempQuat, fromToQuat));
          quat_exports.mul(targetQuat, targetQuat, deltaSrcQuatInDst);
        }
        break;
      case "aim":
        {
          const dstParentWorldQuat = nodeConstraint.destination.parent.rotationWorld;
          const fromVec = vec3_exports.transformQuat(this._tempV3A, nodeConstraint.axis, dstRestQuat);
          vec3_exports.transformQuat(fromVec, fromVec, dstParentWorldQuat);
          const toVec = nodeConstraint.source.getTranslationWorld(this._tempV3B);
          vec3_exports.sub(toVec, toVec, nodeConstraint.destination.getTranslationWorld(this._tempV3));
          vec3_exports.normalize(toVec, toVec);
          const fromToQuat = quat_exports.rotationTo(this._tempQuatA, fromVec, toVec);
          quat_exports.mul(targetQuat, quat_exports.invert(this._tempQuat, dstParentWorldQuat), fromToQuat);
          quat_exports.mul(targetQuat, targetQuat, dstParentWorldQuat);
          quat_exports.mul(targetQuat, targetQuat, dstRestQuat);
        }
        break;
      case "rotation":
        {
          const srcDeltaQuat = quat_exports.mul(targetQuat, srcRestQuatInv, nodeConstraint.source.rotationLocal);
          quat_exports.mul(targetQuat, dstRestQuat, srcDeltaQuat);
        }
        break;
    }
    quat_exports.slerp(targetQuat, dstRestQuat, targetQuat, nodeConstraint.weight);
    nodeConstraint.destination.rotationLocal = targetQuat;
  }
  _updateSpringBones(dt) {
    this._sphereColliders.forEach(({ object, shape, cache }) => {
      const offset2 = vec3_exports.copy(cache.head, shape.offset);
      object.transformVectorWorld(offset2);
      vec3_exports.add(cache.head, object.getPositionWorld(this._tempV3), offset2);
    });
    this._capsuleColliders.forEach(({ object, shape, cache }) => {
      const shapeCenter = object.getPositionWorld(this._tempV3A);
      const headOffset = vec3_exports.copy(cache.head, shape.offset);
      object.transformVectorWorld(headOffset);
      vec3_exports.add(cache.head, shapeCenter, headOffset);
      const tailOffset = vec3_exports.copy(cache.tail, shape.tail);
      object.transformVectorWorld(tailOffset);
      vec3_exports.add(cache.tail, shapeCenter, tailOffset);
    });
    this._springChains.forEach((springChain) => {
      for (let i = 0; i < springChain.joints.length - 1; ++i) {
        const joint = springChain.joints[i];
        if (!joint.state)
          continue;
        const parentWorldRotation = joint.node.parent ? joint.node.parent.getRotationWorld(this._tempQuat) : this._identityQuat;
        const inertia = this._inertia;
        if (springChain.center) {
          vec3_exports.sub(inertia, joint.state.currentTailCenter, joint.state.prevTailCenter);
          springChain.center.transformVectorWorld(inertia);
        } else {
          vec3_exports.sub(inertia, joint.state.currentTail, joint.state.prevTail);
        }
        vec3_exports.scale(inertia, inertia, 1 - joint.dragForce);
        const stiffness = vec3_exports.copy(this._stiffness, joint.state.boneAxis);
        vec3_exports.transformQuat(stiffness, stiffness, joint.state.initialLocalRotation);
        vec3_exports.transformQuat(stiffness, stiffness, parentWorldRotation);
        vec3_exports.scale(stiffness, stiffness, dt * joint.stiffness);
        const external = vec3_exports.scale(this._external, joint.gravityDir, dt * joint.gravityPower);
        const nextTail = vec3_exports.copy(this._tempV3A, joint.state.currentTail);
        vec3_exports.add(nextTail, nextTail, inertia);
        vec3_exports.add(nextTail, nextTail, stiffness);
        vec3_exports.add(nextTail, nextTail, external);
        const worldPosition = joint.node.getPositionWorld(this._tempV3B);
        vec3_exports.sub(nextTail, nextTail, worldPosition);
        vec3_exports.normalize(nextTail, nextTail);
        vec3_exports.scaleAndAdd(nextTail, worldPosition, nextTail, joint.state.boneLength);
        for (const { shape, cache } of springChain.sphereColliders) {
          let tailToShape = this._tailToShape;
          const sphereCenter = cache.head;
          tailToShape = vec3_exports.sub(tailToShape, nextTail, sphereCenter);
          const radius = shape.radius + joint.hitRadius;
          const dist2 = vec3_exports.length(tailToShape) - radius;
          if (dist2 < 0) {
            vec3_exports.normalize(tailToShape, tailToShape);
            vec3_exports.scaleAndAdd(nextTail, nextTail, tailToShape, -dist2);
            vec3_exports.sub(nextTail, nextTail, worldPosition);
            vec3_exports.normalize(nextTail, nextTail);
            vec3_exports.scaleAndAdd(nextTail, worldPosition, nextTail, joint.state.boneLength);
          }
        }
        for (const { shape, cache } of springChain.capsuleColliders) {
          let tailToShape = this._tailToShape;
          const head = cache.head;
          const tail = cache.tail;
          tailToShape = vec3_exports.sub(tailToShape, nextTail, head);
          const headToTail = vec3_exports.sub(this._headToTail, tail, head);
          const dot5 = vec3_exports.dot(headToTail, tailToShape);
          if (vec3_exports.squaredLength(headToTail) <= dot5) {
            vec3_exports.sub(tailToShape, nextTail, tail);
          } else if (dot5 > 0) {
            vec3_exports.scale(headToTail, headToTail, dot5 / vec3_exports.squaredLength(headToTail));
            vec3_exports.sub(tailToShape, tailToShape, headToTail);
          }
          const radius = shape.radius + joint.hitRadius;
          const dist2 = vec3_exports.length(tailToShape) - radius;
          if (dist2 < 0) {
            vec3_exports.normalize(tailToShape, tailToShape);
            vec3_exports.scaleAndAdd(nextTail, nextTail, tailToShape, -dist2);
            vec3_exports.sub(nextTail, nextTail, worldPosition);
            vec3_exports.normalize(nextTail, nextTail);
            vec3_exports.scaleAndAdd(nextTail, worldPosition, nextTail, joint.state.boneLength);
          }
        }
        vec3_exports.copy(joint.state.prevTail, joint.state.currentTail);
        vec3_exports.copy(joint.state.currentTail, nextTail);
        if (springChain.center) {
          vec3_exports.copy(joint.state.prevTailCenter, joint.state.currentTailCenter);
          vec3_exports.copy(joint.state.currentTailCenter, nextTail);
          springChain.center.transformPointInverseWorld(joint.state.currentTailCenter);
        }
        joint.node.parent.transformPointInverseWorld(nextTail);
        const nextTailDualQuat = quat2_exports.fromTranslation(this._tempQuat2, nextTail);
        quat2_exports.multiply(nextTailDualQuat, joint.state.initialLocalTransformInvert, nextTailDualQuat);
        quat2_exports.getTranslation(nextTail, nextTailDualQuat);
        vec3_exports.normalize(nextTail, nextTail);
        const jointRotation = quat_exports.rotationTo(this._tempQuatA, joint.state.boneAxis, nextTail);
        joint.node.setRotationLocal(quat_exports.mul(this._tempQuatA, joint.state.initialLocalRotation, jointRotation));
      }
    });
  }
  /**
   * @param firstPerson Whether the model should render for first person or third person views
   */
  set firstPerson(firstPerson) {
    this._firstPersonAnnotations.forEach((annotation) => {
      const visible = firstPerson == annotation.firstPerson || firstPerson != annotation.thirdPerson;
      annotation.node.getComponents("mesh").forEach((mesh) => {
        mesh.active = visible;
      });
    });
  }
};
__publicField(Vrm, "TypeName", "vrm");
__decorate16([
  property.string()
], Vrm.prototype, "src", void 0);
__decorate16([
  property.object()
], Vrm.prototype, "lookAtTarget", void 0);

// node_modules/@wonderlandengine/components/dist/wasd-controls.js
var __decorate17 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _direction = new Float32Array(3);
var _tempDualQuat = new Float32Array(8);
var WasdControlsComponent = class extends Component3 {
  /** Movement speed in m/s. */
  speed;
  /** Flag for only moving the object on the global x & z planes */
  lockY;
  /** Object of which the orientation is used to determine forward direction */
  headObject;
  right = false;
  down = false;
  left = false;
  up = false;
  start() {
    this.headObject = this.headObject || this.object;
  }
  onActivate() {
    window.addEventListener("keydown", this.press);
    window.addEventListener("keyup", this.release);
  }
  onDeactivate() {
    window.removeEventListener("keydown", this.press);
    window.removeEventListener("keyup", this.release);
  }
  update() {
    vec3_exports.zero(_direction);
    if (this.up)
      _direction[2] -= 1;
    if (this.down)
      _direction[2] += 1;
    if (this.left)
      _direction[0] -= 1;
    if (this.right)
      _direction[0] += 1;
    vec3_exports.normalize(_direction, _direction);
    _direction[0] *= this.speed;
    _direction[2] *= this.speed;
    vec3_exports.transformQuat(_direction, _direction, this.headObject.getTransformWorld(_tempDualQuat));
    if (this.lockY) {
      _direction[1] = 0;
      vec3_exports.normalize(_direction, _direction);
      vec3_exports.scale(_direction, _direction, this.speed);
    }
    this.object.translateLocal(_direction);
  }
  press = (e) => {
    this.handleKey(e, true);
  };
  release = (e) => {
    this.handleKey(e, false);
  };
  handleKey(e, b) {
    if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyZ") {
      this.up = b;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      this.right = b;
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
      this.down = b;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA" || e.code === "KeyQ") {
      this.left = b;
    }
  }
};
__publicField(WasdControlsComponent, "TypeName", "wasd-controls");
__decorate17([
  property.float(0.1)
], WasdControlsComponent.prototype, "speed", void 0);
__decorate17([
  property.bool(false)
], WasdControlsComponent.prototype, "lockY", void 0);
__decorate17([
  property.object()
], WasdControlsComponent.prototype, "headObject", void 0);

// node_modules/@wonderlandengine/components/dist/input-profile.js
var __decorate18 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _tempVec = vec3_exports.create();
var _tempQuat = quat_exports.create();
var _tempRotation1 = new Float32Array(4);
var _tempRotation2 = new Float32Array(4);
var minTemp = new Float32Array(3);
var maxTemp = new Float32Array(3);
var hands = ["left", "right"];
var _InputProfile = class extends Component3 {
  _gamepadObjects = {};
  _controllerModel = null;
  _defaultControllerComponents;
  _handedness;
  _profileJSON = null;
  _buttons = [];
  _axes = [];
  /**
   * The XR gamepad associated with the current input source.
   */
  gamepad;
  /**
   * A reference to the emitter which triggered on model lodaed event.
   */
  onModelLoaded = new Emitter();
  /**
   * Returns url of input profile json file
   */
  url;
  /**
   * A set of components to filter during component retrieval.
   */
  toFilter = /* @__PURE__ */ new Set(["vr-mode-active-mode-switch"]);
  /**
   * The index representing the handedness of the controller (0 for left, 1 for right).
   */
  handedness = 0;
  /**
   * The base path where XR input profiles are stored.
   */
  defaultBasePath;
  /**
   * An optional folder path for loading custom XR input profiles.
   */
  customBasePath;
  /**
   * The default 3D controller model used when a custom model fails to load.
   */
  defaultController;
  /**
   * The object which has HandTracking component added to it.
   */
  trackedHand;
  /**
   * If true, the input profile will be mapped to the default controller, and no dynamic 3D model of controller will be loaded.
   */
  mapToDefaultController;
  /**
   * If true, adds a VR mode switch component to the loaded controller model.
   */
  addVrModeSwitch;
  onActivate() {
    this._handedness = hands[this.handedness];
    const defaultHandName = "Hand" + this._handedness.charAt(0).toUpperCase() + this._handedness.slice(1);
    this.trackedHand = this.trackedHand ?? this.object.parent?.findByNameRecursive(defaultHandName)[0];
    this.defaultController = this.defaultController || this.object.children[0];
    this._defaultControllerComponents = this._getComponents(this.defaultController);
    this.engine.onXRSessionStart.add(() => {
      this.engine.xr?.session.addEventListener("inputsourceschange", this._onInputSourcesChange);
    });
  }
  onDeactivate() {
    this.engine.xr?.session?.removeEventListener("inputsourceschange", this._onInputSourcesChange);
  }
  /**
   * Sets newly loaded controllers for the HandTracking component to proper switching.
   * @param controllerObject The controller object.
   * @hidden
   */
  _setHandTrackingControllers(controllerObject) {
    const handtrackingComponent = this.trackedHand.getComponent(HandTracking);
    if (!handtrackingComponent)
      return;
    handtrackingComponent.controllerToDeactivate = controllerObject;
  }
  /**
   * Retrieves all components from the specified object and its children.
   * @param obj The object to retrieve components from.
   * @return An array of components.
   * @hidden
   */
  _getComponents(obj) {
    const components = [];
    if (obj == null)
      return components;
    const stack = [obj];
    while (stack.length > 0) {
      const currentObj = stack.pop();
      const comps = currentObj.getComponents().filter((c) => !this.toFilter.has(c.type));
      components.push(...comps);
      const children = currentObj.children;
      for (let i = children.length - 1; i >= 0; --i) {
        stack.push(children[i]);
      }
    }
    return components;
  }
  /**
   * Activates or deactivates components based on the specified boolean value.
   * @param active If true, components are set to active; otherwise, they are set to inactive.
   * @hidden
   */
  _setComponentsActive(active) {
    const comps = this._defaultControllerComponents;
    if (comps == void 0)
      return;
    for (let i = 0; i < comps.length; ++i) {
      comps[i].active = active;
    }
  }
  /**
   * Event handler triggered when XR input sources change.
   * Detects new XR input sources and initiates the loading of input profiles.
   * @param event The XR input source change event.
   * @hidden
   */
  _onInputSourcesChange = (event) => {
    if (this._isModelLoaded() && !this.mapToDefaultController) {
      this._setComponentsActive(false);
    }
    event.added.forEach((xrInputSource) => {
      if (xrInputSource.hand != null)
        return;
      if (this._handedness != xrInputSource.handedness)
        return;
      this.gamepad = xrInputSource.gamepad;
      const profile = this.customBasePath !== "" ? this.customBasePath : this.defaultBasePath + xrInputSource.profiles[0];
      this.url = profile + "/profile.json";
      this._profileJSON = _InputProfile.Cache.get(this.url) ?? null;
      if (this._profileJSON != null)
        return;
      fetch(this.url).then((res) => res.json()).then((out) => {
        this._profileJSON = out;
        _InputProfile.Cache.set(this.url, this._profileJSON);
        if (!this._isModelLoaded())
          this._loadAndMapGamepad(profile);
      }).catch((e) => {
        console.error(`Failed to load profile from ${this.url}. Reason:`, e);
      });
    });
  };
  /**
   * Checks if the 3D controller model is loaded.
   * @return True if the model is loaded; otherwise, false.
   * @hidden
   */
  _isModelLoaded() {
    return this._controllerModel !== null;
  }
  /**
   * Loads the 3D controller model and caches the mapping to the gamepad.
   * @param profile The path to the input profile.
   * @hidden
   */
  async _loadAndMapGamepad(profile) {
    const assetPath = profile + "/" + this._handedness + ".glb";
    this._controllerModel = this.defaultController;
    if (!this.mapToDefaultController) {
      try {
        this._controllerModel = await this.engine.scene.append(assetPath);
      } catch (e) {
        console.error(`Failed to load i-p controller model. Reason:`, e, `Continuing with ${this._handedness} default controller.`);
        this._setComponentsActive(true);
      }
      this._controllerModel.parent = this.object;
      this._controllerModel.setPositionLocal([0, 0, 0]);
      this._setComponentsActive(false);
      if (this.addVrModeSwitch)
        this._controllerModel.addComponent(VrModeActiveSwitch);
      this.onModelLoaded.notify();
    }
    this._cacheGamepadObjectsFromProfile(this._profileJSON, this._controllerModel);
    this._setHandTrackingControllers(this._controllerModel);
    this.update = () => this._mapGamepadInput();
  }
  /**
   * Caches gamepad objects (buttons, axes) from the loaded input profile.
   * @hidden
   */
  _cacheGamepadObjectsFromProfile(profile, obj) {
    const components = profile.layouts[this._handedness].components;
    if (!components)
      return;
    this._buttons = [];
    this._axes = [];
    for (const i in components) {
      const visualResponses = components[i].visualResponses;
      if (components[i].rootNodeName === "menu")
        continue;
      for (const j in visualResponses) {
        const visualResponse = visualResponses[j];
        const valueNode = visualResponse.valueNodeName;
        const minNode = visualResponse.minNodeName;
        const maxNode = visualResponse.maxNodeName;
        this._gamepadObjects[valueNode] = obj.findByNameRecursive(valueNode)[0];
        this._gamepadObjects[minNode] = obj.findByNameRecursive(minNode)[0];
        this._gamepadObjects[maxNode] = obj.findByNameRecursive(maxNode)[0];
        const prop = visualResponses[j].componentProperty;
        const response = {
          target: this._gamepadObjects[valueNode],
          min: this._gamepadObjects[minNode],
          max: this._gamepadObjects[maxNode],
          id: components[i].gamepadIndices[prop]
          // Assign a unique ID
        };
        switch (prop) {
          case "button":
            this._buttons.push(response);
            break;
          case "xAxis":
          case "yAxis":
            this._axes.push(response);
            break;
        }
      }
    }
  }
  /**
   * Assigns a transformed position and rotation to the target based on minimum and maximum values and a normalized input value.
   * @param target The target object to be transformed.
   * @param min The minimum object providing transformation limits.
   * @param max The maximum object providing transformation limits.
   * @param value The normalized input value.
   * @hidden
   */
  _assignTransform(target, min2, max2, value) {
    vec3_exports.lerp(_tempVec, min2.getPositionWorld(minTemp), max2.getPositionWorld(maxTemp), value);
    target.setPositionWorld(_tempVec);
    quat_exports.lerp(_tempQuat, min2.getRotationWorld(_tempRotation1), max2.getRotationWorld(_tempRotation2), value);
    quat_exports.normalize(_tempQuat, _tempQuat);
    target.setRotationWorld(_tempQuat);
  }
  /**
   * Maps input values (buttons, axes) to the 3D controller model.
   * @hidden
   */
  _mapGamepadInput() {
    for (const button of this._buttons) {
      const buttonValue = this.gamepad.buttons[button.id].value;
      this._assignTransform(button.target, button.min, button.max, buttonValue);
    }
    for (const axis of this._axes) {
      const axisValue = this.gamepad.axes[axis.id];
      const normalizedAxisValue = (axisValue + 1) / 2;
      this._assignTransform(axis.target, axis.min, axis.max, normalizedAxisValue);
    }
  }
};
var InputProfile = _InputProfile;
__publicField(InputProfile, "TypeName", "input-profile");
/**
 * A cache to store loaded profiles for reuse.
 */
__publicField(InputProfile, "Cache", /* @__PURE__ */ new Map());
__decorate18([
  property.enum(hands, 0)
], InputProfile.prototype, "handedness", void 0);
__decorate18([
  property.string("https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@latest/dist/profiles/")
], InputProfile.prototype, "defaultBasePath", void 0);
__decorate18([
  property.string()
], InputProfile.prototype, "customBasePath", void 0);
__decorate18([
  property.object()
], InputProfile.prototype, "defaultController", void 0);
__decorate18([
  property.object()
], InputProfile.prototype, "trackedHand", void 0);
__decorate18([
  property.bool(false)
], InputProfile.prototype, "mapToDefaultController", void 0);
__decorate18([
  property.bool(true)
], InputProfile.prototype, "addVrModeSwitch", void 0);

// node_modules/@wonderlandengine/components/dist/orbital-camera.js
var __decorate19 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var preventDefault2 = (e) => {
  e.preventDefault();
};
var tempVec5 = [0, 0, 0];
var tempquat = quat_exports.create();
var tempquat2 = quat_exports.create();
var tempVec33 = vec3_exports.create();
var OrbitalCamera = class extends Component3 {
  mouseButtonIndex = 0;
  radial = 5;
  minElevation = 0;
  maxElevation = 89.99;
  minZoom = 0.01;
  maxZoom = 10;
  xSensitivity = 0.5;
  ySensitivity = 0.5;
  zoomSensitivity = 0.02;
  damping = 0.9;
  target = null;
  _mouseDown = false;
  _origin = vec3_exports.create();
  _originCache = vec3_exports.create();
  _azimuth = 0;
  _polar = 45;
  _initialPinchDistance = 0;
  _touchStartX = 0;
  _touchStartY = 0;
  _azimuthSpeed = 0;
  _polarSpeed = 0;
  init() {
    if (this.target) {
      this.target.getPositionWorld(this._origin);
    } else {
      this.object.getPositionWorld(this._origin);
    }
  }
  start() {
    this._polar = Math.min(this.maxElevation, Math.max(this.minElevation, this._polar));
    this._updateCamera();
  }
  onActivate() {
    const canvas2 = this.engine.canvas;
    if (this.mouseButtonIndex === 2) {
      canvas2.addEventListener("contextmenu", preventDefault2, { passive: false });
    }
    canvas2.addEventListener("mousedown", this._onMouseDown);
    canvas2.addEventListener("wheel", this._onMouseScroll, { passive: false });
    canvas2.addEventListener("touchstart", this._onTouchStart, { passive: false });
    canvas2.addEventListener("touchmove", this._onTouchMove, { passive: false });
    canvas2.addEventListener("touchend", this._onTouchEnd);
  }
  onDeactivate() {
    const canvas2 = this.engine.canvas;
    if (this.mouseButtonIndex === 2) {
      canvas2.removeEventListener("contextmenu", preventDefault2);
    }
    canvas2.removeEventListener("mousemove", this._onMouseMove);
    canvas2.removeEventListener("mousedown", this._onMouseDown);
    canvas2.removeEventListener("wheel", this._onMouseScroll);
    canvas2.removeEventListener("touchstart", this._onTouchStart);
    canvas2.removeEventListener("touchmove", this._onTouchMove);
    canvas2.removeEventListener("touchend", this._onTouchEnd);
    this._mouseDown = false;
    this._initialPinchDistance = 0;
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._azimuthSpeed = 0;
    this._polarSpeed = 0;
  }
  update() {
    if (this.target) {
      this.target.getPositionWorld(this._origin);
    }
    this._azimuthSpeed *= this.damping;
    this._polarSpeed *= this.damping;
    if (Math.abs(this._azimuthSpeed) < 0.01)
      this._azimuthSpeed = 0;
    if (Math.abs(this._polarSpeed) < 0.01)
      this._polarSpeed = 0;
    this._azimuth += this._azimuthSpeed;
    this._polar += this._polarSpeed;
    this._polar = Math.min(this.maxElevation, Math.max(this.minElevation, this._polar));
    if (this._azimuthSpeed !== 0 || this._polarSpeed !== 0 || vec3_exports.equals(this._origin, this._originCache) === false) {
      this._updateCamera();
      vec3_exports.copy(this._originCache, this._origin);
    }
  }
  /**
   * Get the closest position to the given position on the orbit sphere of the camera.
   * This can be used to get a position and rotation to transition to.
   *
   * You pass this a position object. The method calculates the closest positition and updates the position parameter.
   * It also sets the rotation parameter to reflect the rotate the camera will have when it is on the orbit sphere,
   * pointing towards the center.
   * @param position the position to get the closest position to
   * @param rotation the rotation to get the closest position to
   */
  getClosestPosition(position, rotation) {
    this.object.getRotationWorld(tempquat);
    this.object.lookAt(this._origin);
    this.object.getRotationWorld(tempquat2);
    if (quat_exports.dot(tempquat, tempquat2) < 0) {
      quat_exports.scale(tempquat2, tempquat2, -1);
    }
    this.object.setRotationWorld(tempquat);
    const directionToCamera = vec3_exports.create();
    vec3_exports.subtract(directionToCamera, position, this._origin);
    vec3_exports.normalize(directionToCamera, directionToCamera);
    const nearestPointOnSphere = vec3_exports.create();
    vec3_exports.scale(nearestPointOnSphere, directionToCamera, this.radial);
    vec3_exports.add(nearestPointOnSphere, nearestPointOnSphere, this._origin);
    vec3_exports.copy(position, nearestPointOnSphere);
    quat_exports.copy(rotation, tempquat2);
  }
  /**
   * Set the camera position based on the given position and calculate the rotation.
   * @param cameraPosition the position to set the camera to
   */
  setPosition(cameraPosition) {
    const centerOfOrbit = this._origin;
    vec3_exports.subtract(tempVec33, cameraPosition, centerOfOrbit);
    vec3_exports.normalize(tempVec33, tempVec33);
    const azimuth = Math.atan2(tempVec33[0], tempVec33[2]);
    const polar = Math.acos(tempVec33[1]);
    const azimuthDeg = rad2deg(azimuth);
    const polarDeg = 90 - rad2deg(polar);
    this._azimuth = azimuthDeg;
    this._polar = polarDeg;
  }
  /**
   * Update the camera position based on the current azimuth,
   * polar and radial values
   */
  _updateCamera() {
    const azimuthInRadians = deg2rad(this._azimuth);
    const polarInRadians = deg2rad(this._polar);
    tempVec5[0] = this.radial * Math.sin(azimuthInRadians) * Math.cos(polarInRadians);
    tempVec5[1] = this.radial * Math.sin(polarInRadians);
    tempVec5[2] = this.radial * Math.cos(azimuthInRadians) * Math.cos(polarInRadians);
    this.object.setPositionWorld(tempVec5);
    this.object.translateWorld(this._origin);
    this.object.lookAt(this._origin);
  }
  /* Mouse Event Handlers */
  _onMouseDown = (e) => {
    window.addEventListener("mouseup", this._onMouseUp);
    window.addEventListener("mousemove", this._onMouseMove);
    if (e.button === this.mouseButtonIndex) {
      this._mouseDown = true;
      document.body.style.cursor = "grabbing";
      if (e.button === 1) {
        e.preventDefault();
        return false;
      }
    }
  };
  _onMouseUp = (e) => {
    window.removeEventListener("mouseup", this._onMouseUp);
    window.removeEventListener("mousemove", this._onMouseMove);
    if (e.button === this.mouseButtonIndex) {
      this._mouseDown = false;
      document.body.style.cursor = "initial";
    }
  };
  _onMouseMove = (e) => {
    if (this.active && this._mouseDown) {
      if (this.active && this._mouseDown) {
        this._azimuthSpeed = -(e.movementX * this.xSensitivity);
        this._polarSpeed = e.movementY * this.ySensitivity;
      }
    }
  };
  _onMouseScroll = (e) => {
    e.preventDefault();
    this.radial *= 1 - e.deltaY * this.zoomSensitivity * -1e-3;
    this.radial = Math.min(this.maxZoom, Math.max(this.minZoom, this.radial));
    this._updateCamera();
  };
  /* Touch event handlers */
  _onTouchStart = (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
      this._mouseDown = true;
    } else if (e.touches.length === 2) {
      this._initialPinchDistance = this._getDistanceBetweenTouches(e.touches);
      e.preventDefault();
    }
  };
  _onTouchMove = (e) => {
    if (!this.active || !this._mouseDown) {
      return;
    }
    e.preventDefault();
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - this._touchStartX;
      const deltaY = e.touches[0].clientY - this._touchStartY;
      this._azimuthSpeed = -(deltaX * this.xSensitivity);
      this._polarSpeed = deltaY * this.ySensitivity;
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const currentPinchDistance = this._getDistanceBetweenTouches(e.touches);
      const pinchScale = this._initialPinchDistance / currentPinchDistance;
      this.radial *= pinchScale;
      this.radial = Math.min(this.maxZoom, Math.max(this.minZoom, this.radial));
      this._updateCamera();
      this._initialPinchDistance = currentPinchDistance;
    }
  };
  _onTouchEnd = (e) => {
    if (e.touches.length < 2) {
      this._mouseDown = false;
    }
    if (e.touches.length === 1) {
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
    }
  };
  /**
   * Helper function to calculate the distance between two touch points
   * @param touches list of touch points
   * @returns distance between the two touch points
   */
  _getDistanceBetweenTouches(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
};
__publicField(OrbitalCamera, "TypeName", "orbital-camera");
__decorate19([
  property.int()
], OrbitalCamera.prototype, "mouseButtonIndex", void 0);
__decorate19([
  property.float(5)
], OrbitalCamera.prototype, "radial", void 0);
__decorate19([
  property.float()
], OrbitalCamera.prototype, "minElevation", void 0);
__decorate19([
  property.float(89.99)
], OrbitalCamera.prototype, "maxElevation", void 0);
__decorate19([
  property.float()
], OrbitalCamera.prototype, "minZoom", void 0);
__decorate19([
  property.float(10)
], OrbitalCamera.prototype, "maxZoom", void 0);
__decorate19([
  property.float(0.5)
], OrbitalCamera.prototype, "xSensitivity", void 0);
__decorate19([
  property.float(0.5)
], OrbitalCamera.prototype, "ySensitivity", void 0);
__decorate19([
  property.float(0.02)
], OrbitalCamera.prototype, "zoomSensitivity", void 0);
__decorate19([
  property.float(0.9)
], OrbitalCamera.prototype, "damping", void 0);
__decorate19([
  property.object()
], OrbitalCamera.prototype, "target", void 0);

// js/button.ts
function hapticFeedback(object, strength, duration) {
  const input = object.getComponent(InputComponent);
  if (input && input.xrInputSource) {
    const gamepad = input.xrInputSource.gamepad;
    if (gamepad && gamepad.hapticActuators)
      gamepad.hapticActuators[0].pulse(strength, duration);
  }
}
var ButtonComponent = class extends Component3 {
  static onRegister(engine2) {
    engine2.registerComponent(CursorTarget);
  }
  buttonMeshObject;
  hoverMaterial;
  /* Position to return to when "unpressing" the button */
  returnPos = new Float32Array(3);
  mesh;
  defaultMaterial;
  target;
  onDown() {
  }
  start() {
    this.mesh = this.buttonMeshObject.getComponent(MeshComponent);
    this.defaultMaterial = this.mesh.material;
    this.object.getPositionLocal(this.returnPos);
    this.target = this.object.getComponent(CursorTarget) || this.object.addComponent(CursorTarget);
  }
  onActivate() {
    this.target.onHover.add(this._onHover);
    this.target.onUnhover.add(this._onUnhover);
    this.target.onDown.add(this._onDown);
    this.target.onUp.add(this._onUp);
  }
  onDeactivate() {
    this.target.onHover.remove(this._onHover);
    this.target.onUnhover.remove(this._onUnhover);
    this.target.onDown.remove(this._onDown);
    this.target.onUp.remove(this._onUp);
  }
  /* Called by 'cursor-target' */
  _onHover = (_, cursor) => {
    this.mesh.material = this.hoverMaterial;
    if (cursor.type === "finger-cursor") {
      this._onDown(_, cursor);
    }
    hapticFeedback(cursor.object, 0.5, 50);
  };
  /* Called by 'cursor-target' */
  _onDown = (_, cursor) => {
    this.object.translateLocal([0, 0, -0.05]);
    hapticFeedback(cursor.object, 1, 20);
    this.onDown();
  };
  /* Called by 'cursor-target' */
  _onUp = (_, cursor) => {
    this.object.setPositionLocal(this.returnPos);
    hapticFeedback(cursor.object, 0.7, 20);
  };
  /* Called by 'cursor-target' */
  _onUnhover = (_, cursor) => {
    this.mesh.material = this.defaultMaterial;
    if (cursor.type === "finger-cursor") {
      this._onUp(_, cursor);
    }
    hapticFeedback(cursor.object, 0.3, 50);
  };
};
__publicField(ButtonComponent, "TypeName", "button");
__publicField(ButtonComponent, "Properties", {
  buttonMeshObject: Property.object()
});
__decorateClass([
  property.object({ required: true })
], ButtonComponent.prototype, "buttonMeshObject", 2);
__decorateClass([
  property.material({ required: true })
], ButtonComponent.prototype, "hoverMaterial", 2);

// js/button-gi.ts
var ButtonToggleGI = class extends ButtonComponent {
  targetMesh;
  materialGI;
  _meshes;
  _materials;
  _switch = true;
  onActivate() {
    super.onActivate();
    this._meshes = this.targetMesh.getComponents("mesh");
    this._materials = this._meshes.map((c) => c.material);
  }
  onDeactivate() {
    super.onDeactivate();
    for (let i = 0; i < this._meshes.length; ++i) {
      this._meshes[i].material = this._materials[i];
    }
  }
  onDown() {
    for (let i = 0; i < this._meshes.length; ++i) {
      this._meshes[i].material = this._switch ? this.materialGI : this._materials[i];
    }
    this._switch = !this._switch;
  }
};
__publicField(ButtonToggleGI, "TypeName", "button-gi");
__decorateClass([
  property.object({ required: true })
], ButtonToggleGI.prototype, "targetMesh", 2);
__decorateClass([
  property.material({ required: true })
], ButtonToggleGI.prototype, "materialGI", 2);

// js/button-light.ts
var ButtonLight = class extends ButtonComponent {
  onDown() {
    const lights = this.scene.getComponents("light").filter((c) => c.lightType === LightType.Sun);
    for (const light of lights) {
      light.active = !light.active;
    }
  }
};
__publicField(ButtonLight, "TypeName", "button-light");

// js/trajectory.ts
var SPEED = 0.5;
var _point = vec3_exports.create();
var Trajectory = class extends Component3 {
  startPos;
  endPos;
  t = 0;
  onActivate() {
    this.t = Math.random();
  }
  update(dt) {
    vec3_exports.lerp(_point, this.startPos, this.endPos, Math.sin(this.t) * 0.5 + 0.5);
    this.object.setPositionWorld(_point);
    this.t += dt * SPEED;
  }
};
__publicField(Trajectory, "TypeName", "trajectory");
__decorateClass([
  property.vector3()
], Trajectory.prototype, "startPos", 2);
__decorateClass([
  property.vector3()
], Trajectory.prototype, "endPos", 2);

// js/index.js
var Constants = {
  ProjectName: "Sponza",
  RuntimeBaseName: "WonderlandRuntime",
  WebXRRequiredFeatures: ["local"],
  WebXROptionalFeatures: ["local", "hand-tracking", "hit-test"]
};
var RuntimeOptions = {
  webgl2: true,
  webgpu: false,
  physx: false,
  loader: false,
  xrFramebufferScaleFactor: 1,
  loadUncompressedImagesAsBitmap: false,
  xrOfferSession: {
    mode: "auto",
    features: Constants.WebXRRequiredFeatures,
    optionalFeatures: Constants.WebXROptionalFeatures
  },
  canvas: "canvas"
};
var engine = await loadRuntime(Constants.RuntimeBaseName, RuntimeOptions);
Object.assign(engine, dist_exports);
window.WL = engine;
engine.onSceneLoaded.once(() => {
  const el = document.getElementById("version");
  if (el)
    setTimeout(() => el.remove(), 2e3);
});
function requestSession(mode) {
  engine.requestXRSession(
    mode,
    Constants.WebXRRequiredFeatures,
    Constants.WebXROptionalFeatures
  ).catch((e) => console.error(e));
}
function setupButtonsXR() {
  const arButton = document.getElementById("ar-button");
  if (arButton) {
    arButton.dataset.supported = engine.arSupported;
    arButton.addEventListener("click", () => requestSession("immersive-ar"));
  }
  const vrButton = document.getElementById("vr-button");
  if (vrButton) {
    vrButton.dataset.supported = engine.vrSupported;
    vrButton.addEventListener("click", () => requestSession("immersive-vr"));
  }
}
if (document.readyState === "loading") {
  window.addEventListener("load", setupButtonsXR);
} else {
  setupButtonsXR();
}
engine.registerComponent(Cursor);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(WasdControlsComponent);
engine.registerComponent(ButtonToggleGI);
engine.registerComponent(ButtonLight);
engine.registerComponent(Trajectory);
engine.scene.load(`${Constants.ProjectName}.bin`);
//# sourceMappingURL=Sponza-bundle.js.map
