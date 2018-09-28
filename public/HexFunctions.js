
function Point(x, y) {
	return {x: x, y: y};
};

function Orientation(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
	return {f0: f0, f1: f1, f2: f2, f3: f3, b0: b0, b1: b1, b2: b2, b3: b3, start_angle: start_angle};
};

function Layout(orientation, size, origin) {
	return {orientation: orientation, size: size, origin: origin};
};

function Hex(q, r, s) {
	if (Math.round(q + r + s) !== 0) throw "q + r + s must be 0";
	return {q: q, r: r, s: s};
};

var hex_directions = [Hex(1, 0, -1), Hex(1, -1, 0), Hex(0, -1, 1), Hex(-1, 0, 1), Hex(-1, 1, 0), Hex(0, 1, -1)];

function hex_direction(direction)
{
    return hex_directions[direction];
};

function hex_round(h) {
	var qi = Math.round(h.q);
	var ri = Math.round(h.r);
	var si = Math.round(h.s);
	var q_diff = Math.abs(qi - h.q);
	var r_diff = Math.abs(ri - h.r);
	var s_diff = Math.abs(si - h.s);
	if (q_diff > r_diff && q_diff > s_diff)
	{
		qi = -ri - si;
	}
	else
		if (r_diff > s_diff)
		{
			ri = -qi - si;
		}
		else
		{
			si = -qi - ri;
		}
	
	return Hex(qi, ri, si);
};

function hex_to_pixel(layout, h)
	{
		var M = layout.orientation;
		var size = layout.size;
		var origin = layout.origin;
		var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
		var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
		return Point(x + origin.x, y + origin.y);
	};

function pixel_to_hex(layout, p)
{
	var M = layout.orientation;
	var size = layout.size;
	var origin = layout.origin;
	var pt = Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
	var q = M.b0 * pt.x + M.b1 * pt.y;
	var r = M.b2 * pt.x + M.b3 * pt.y;
	
	return Hex(q, r, -q - r);
};

function hex_corner_offset(layout, corner)
{
	var M = layout.orientation;
	var size = layout.size;
	var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6;
	return Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
};

function polygon_corners(layout, h)
{
	var corners = [];
	var center = hex_to_pixel(layout, h);
	
	for (var i = 0; i < 6; i++)
	{
		var offset = hex_corner_offset(layout, i);
		corners.push(Point(center.x + offset.x, center.y + offset.y));
	}
	return corners;
};

function center_of_hex (layout, h) {
	return hex_to_pixel(layout, h);
};

function hex_scale(a, k)
{
    return Hex(a.q * k, a.r * k, a.s * k);
};

function hex_add(a, b)
{
    return Hex(a.q + b.q, a.r + b.r, a.s + b.s);
};

function hex_neighbor(hex, direction)
{
    return hex_add(hex, hex_direction(direction));
};
		