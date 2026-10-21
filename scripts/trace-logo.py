"""Trace the five violet components using binary marching cell boundaries.
Run: python3 -I scripts/trace-logo.py. Only Pillow is required.
"""
from pathlib import Path
from PIL import Image
from collections import deque
import math

ROOT = Path(__file__).resolve().parents[1]
image = Image.open(ROOT / 'src/images/brand/shiftcodes-logo-source.jpg').convert('RGB')
pixels = {(x, y) for y in range(min(560, image.height)) for x in range(image.width)
          if (lambda r, g, b: b > 140 and b > r * 1.35 and b > g * 1.5)(*image.getpixel((x, y)))}
components = []
while pixels:
    seed = pixels.pop()
    component, queue = {seed}, deque([seed])
    while queue:
        x, y = queue.popleft()
        for p in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if p in pixels:
                pixels.remove(p); component.add(p); queue.append(p)
    if len(component) > 100:
        components.append(component)
assert len(components) == 5, [len(c) for c in components]

def simplify(points, tolerance=1.5):
    a, b = points[0], points[-1]
    length = math.dist(a, b)
    distances = [abs((b[0]-a[0])*(a[1]-p[1])-(a[0]-p[0])*(b[1]-a[1])) / length if length else math.dist(a,p) for p in points]
    index = max(range(len(points)), key=distances.__getitem__)
    if distances[index] <= tolerance:
        return [a,b]
    return simplify(points[:index+1], tolerance)[:-1] + simplify(points[index:], tolerance)

def contour(component):
    # March the exposed edges of occupied binary cells, clockwise.
    edges = {}
    for x,y in component:
        for neighbor,a,b in [((x,y-1),(x,y),(x+1,y)),((x+1,y),(x+1,y),(x+1,y+1)),((x,y+1),(x+1,y+1),(x,y+1)),((x-1,y),(x,y+1),(x,y))]:
            if neighbor not in component: edges[a] = b
    loops = []
    while edges:
        start = next(iter(edges)); p = start; loop = [p]
        while True:
            p = edges.pop(p); loop.append(p)
            if p == start: break
        loops.append(loop)
    loop = max(loops, key=len)
    # Split the closed ring at its farthest vertex for stable Douglas–Peucker.
    mid = max(range(len(loop)-1), key=lambda i: math.dist(loop[0],loop[i]))
    tolerance = 1.5 if len(component) > 10000 else 1.0
    return simplify(loop[:mid+1], tolerance)[:-1] + simplify(loop[mid:], tolerance)

hooks = sorted(sorted(components, key=len, reverse=True)[:2], key=lambda c: min(y for x,y in c))
glyphs = sorted([c for c in components if c not in hooks], key=lambda c: min(x for x,y in c))
ordered = list(zip(['sc-hook-top','sc-hook-bottom','sc-lt','sc-slash','sc-gt'], hooks+glyphs))
x0 = min(x for c in components for x,y in c); y0 = min(y for c in components for x,y in c)
x1 = max(x for c in components for x,y in c)+1; y1 = max(y for c in components for x,y in c)+1
def unit(a, b):
    length = math.dist(a, b)
    return ((b[0]-a[0])/length, (b[1]-a[1])/length)

def shifted(p, v, distance):
    return (p[0]+v[0]*distance, p[1]+v[1]*distance)

def fmt(p):
    return f'{p[0]:.3f},{p[1]:.3f}'

def smooth_hook(component):
    points = [(x-x0, y-y0) for x,y in contour(component)[:-1]]
    # Start on a long edge so a rounded run never crosses the ring seam.
    long_edges = [i for i in range(len(points)) if math.dist(points[i], points[(i+1)%len(points)]) >= 32]
    start = long_edges[0]
    points = points[start:] + points[:start]
    points += [points[0]]
    data, samples = 'M'+fmt(points[0]), [points[0]]
    i = 0
    while i < len(points)-1:
        if math.dist(points[i], points[i+1]) >= 32:
            data += ' L'+fmt(points[i+1]); samples.append(points[i+1]); i += 1
            continue
        end = i+1
        while end < len(points)-1 and math.dist(points[end], points[end+1]) < 32:
            end += 1
        a, b = points[i], points[end]
        incoming = unit(points[i-1], a)
        outgoing = unit(b, points[(end+1) % (len(points)-1)])
        # Tangent controls approximate the quarter-circle corner (0.55r).
        radius = math.dist(a, b) / math.sqrt(2)
        # Fit tangent handle lengths to the measured corner samples. Start
        # with the circular 0.55r handles, then least-squares refine them.
        aa = ab = bb = ay = by = 0
        run = points[i:end+1]
        distances = [0]
        for p, q in zip(run, run[1:]): distances.append(distances[-1]+math.dist(p,q))
        for p, distance in zip(run[1:-1], distances[1:-1]):
            t = distance/distances[-1]; u = 1-t
            va = tuple(3*u*u*t*v for v in incoming)
            vb = tuple(-3*u*t*t*v for v in outgoing)
            target = tuple(p[k] - ((u**3+3*u*u*t)*a[k]+(3*u*t*t+t**3)*b[k]) for k in (0,1))
            aa += sum(v*v for v in va); ab += sum(v*w for v,w in zip(va,vb))
            bb += sum(v*v for v in vb)
            ay += sum(v*w for v,w in zip(va,target)); by += sum(v*w for v,w in zip(vb,target))
        determinant = aa*bb-ab*ab
        h1 = (ay*bb-by*ab)/determinant if determinant > 1e-8 else .55*radius
        h2 = (by*aa-ay*ab)/determinant if determinant > 1e-8 else .55*radius
        c1 = shifted(a, incoming, max(0,h1))
        c2 = shifted(b, outgoing, -max(0,h2))
        data += ' C'+fmt(c1)+' '+fmt(c2)+' '+fmt(b)
        for step in range(1, 101):
            t = step/100; u = 1-t
            samples.append(tuple(u**3*a[k]+3*u*u*t*c1[k]+3*u*t*t*c2[k]+t**3*b[k] for k in (0,1)))
        i = end
    return data+' Z', samples

def glyph(component, centres):
    # Fit the uniform width to the mask area; centreline positions are measured
    # from the source. Rounded end caps contribute pi*r*r to the outline.
    length = sum(math.dist(a,b) for a,b in zip(centres, centres[1:]))
    width = 2*(math.sqrt(length*length+math.pi*len(component))-length)/math.pi
    r = width/2
    directions = [unit(a,b) for a,b in zip(centres, centres[1:])]
    normals = [(-v[1],v[0]) for v in directions]
    sides = []
    for sign in (1,-1):
        side = [shifted(centres[0], normals[0], sign*r)]
        if len(centres) == 3:
            n = (normals[0][0]+normals[1][0], normals[0][1]+normals[1][1])
            denominator = 1+sum(a*b for a,b in zip(normals[0],normals[1]))
            side.append(shifted(centres[1], n, sign*r/denominator))
        side.append(shifted(centres[-1], normals[-1], sign*r))
        sides.append(side)
    left, right = sides
    data = 'M'+' L'.join(map(fmt,left))
    data += f' A{r:.3f},{r:.3f} 0 0 0 '+fmt(right[-1])
    data += ' L'+' L'.join(map(fmt,reversed(right[:-1])))
    data += f' A{r:.3f},{r:.3f} 0 0 0 '+fmt(left[0])+' Z'
    samples = list(left)
    for centre, normal in ((centres[-1],normals[-1]), (centres[0],(-normals[0][0],-normals[0][1]))):
        angle = math.atan2(normal[1],normal[0])
        samples.extend((centre[0]+r*math.cos(angle-math.pi*j/100), centre[1]+r*math.sin(angle-math.pi*j/100)) for j in range(1,101))
        if centre == centres[-1]: samples.extend(reversed(right[:-1]))
    print(f'{name}: fitted stroke width={width:.3f}')
    return data, samples

centrelines = {'sc-lt': [(170,206),(130,234),(170,262)],
               'sc-slash': [(219,192),(191,277)],
               'sc-gt': [(237,206),(278,234),(237,262)]}
paths = []
for name, component in ordered:
    data, points = smooth_hook(component) if name not in centrelines else glyph(component, centrelines[name])
    area = abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points,points[1:]+points[:1]))) / 2
    error = (area / len(component)-1)*100
    print(f'{name}: pixels={len(component)}, outline={area:.1f}, error={error:+.2f}%')
    assert abs(error) <= 3
    paths.append(f'  <path id="{name}" d="{data}"/>')
(ROOT / 'src/images/brand/shiftcodes-mark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {x1-x0} {y1-y0}" fill="#6E2BFB">\n'+'\n'.join(paths)+'\n</svg>\n')
