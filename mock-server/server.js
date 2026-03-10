const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("mock-server/db.json");
const middlewares = jsonServer.defaults({ noCors: false });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Explicit CORS for all routes
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// --- AUTH ---
server.post("/api/v1/auth/login", (req, res) => {
  const { username, password } = req.body;
  const db = router.db.getState();
  const user = db.auth.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }
  res.json({
    access_token: "mock-jwt-token-" + user.id,
    refresh_token: "mock-refresh-token-" + user.id,
    token_type: "bearer",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    },
  });
});

server.get("/api/v1/auth/me", (req, res) => {
  const db = router.db.getState();
  res.json(db.auth[0]);
});

// --- CONNECTIONS ---
server.get("/api/v1/connections", (req, res) => {
  const db = router.db.getState();
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 50;
  const items = db.connections;
  res.json({
    items,
    total: items.length,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(items.length / pageSize),
  });
});

server.get("/api/v1/connections/:id", (req, res) => {
  const db = router.db.getState();
  const conn = db.connections.find((c) => c.id === req.params.id);
  if (!conn) return res.status(404).json({ detail: "Not found" });
  res.json(conn);
});

server.post("/api/v1/connections", (req, res) => {
  const db = router.db.getState();
  const newConn = {
    id: "conn-" + (db.connections.length + 1),
    ...req.body,
    status: "active",
    last_tested_at: new Date().toISOString(),
    last_error: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tables_count: 0,
    database_size_mb: 0,
  };
  db.connections.push(newConn);
  router.db.setState(db);
  res.status(201).json(newConn);
});

server.put("/api/v1/connections/:id", (req, res) => {
  const db = router.db.getState();
  const idx = db.connections.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ detail: "Not found" });
  db.connections[idx] = {
    ...db.connections[idx],
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  router.db.setState(db);
  res.json(db.connections[idx]);
});

server.delete("/api/v1/connections/:id", (req, res) => {
  const db = router.db.getState();
  db.connections = db.connections.filter((c) => c.id !== req.params.id);
  router.db.setState(db);
  res.status(204).end();
});

server.post("/api/v1/connections/test", (req, res) => {
  setTimeout(() => {
    res.json({
      success: true,
      latency_ms: Math.floor(Math.random() * 100) + 20,
      database_version: "PostgreSQL 15.4",
      tables_count: Math.floor(Math.random() * 20) + 5,
      database_size_mb: Math.floor(Math.random() * 1000) + 100,
    });
  }, 1200);
});

server.post("/api/v1/connections/:id/test", (req, res) => {
  const db = router.db.getState();
  const conn = db.connections.find((c) => c.id === req.params.id);
  setTimeout(() => {
    if (conn && conn.status === "active") {
      conn.last_tested_at = new Date().toISOString();
      conn.last_error = null;
      router.db.setState(db);
      res.json({
        success: true,
        latency_ms: Math.floor(Math.random() * 80) + 10,
        database_version:
          conn.type === "postgresql" ? "PostgreSQL 15.4" : "MySQL 8.0.32",
        tables_count: conn.tables_count || 10,
        database_size_mb: conn.database_size_mb || 500,
      });
    } else {
      res.json({
        success: false,
        error: conn?.last_error || "Connection refused",
      });
    }
  }, 800);
});

// --- THREADS ---
server.post("/threads/search", (req, res) => {
  const db = router.db.getState();
  const limit = req.body.limit || 50;
  const offset = req.body.offset || 0;
  const threads = db.threads.slice(offset, offset + limit);
  res.json(threads);
});

server.post("/threads", (req, res) => {
  const db = router.db.getState();
  const newThread = {
    id: req.body.thread_id || "thread-" + Date.now(),
    thread_id: req.body.thread_id || "thread-" + Date.now(),
    title: req.body.title || "New Conversation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    message_count: 0,
    connection_id: null,
    connection_name: null,
  };
  db.threads.unshift(newThread);
  router.db.setState(db);
  res.status(201).json(newThread);
});

server.get("/threads/:threadId/state", (req, res) => {
  const db = router.db.getState();
  const thread = db.threads.find((t) => t.thread_id === req.params.threadId);
  const threadMessages = db.messages.filter(
    (m) => m.thread_id === req.params.threadId
  );
  const lastAssistant = [...threadMessages]
    .reverse()
    .find((m) => m.role === "assistant");
  res.json({
    thread_id: req.params.threadId,
    title: thread?.title,
    messages: threadMessages.map((m) => ({
      role: m.role === "human" ? "human" : "assistant",
      content: m.content,
    })),
    values: {
      messages: threadMessages,
      final_canvas: lastAssistant?.canvas || null,
      connection_id: thread?.connection_id,
      connection_name: thread?.connection_name,
    },
  });
});

server.delete("/threads/:threadId", (req, res) => {
  const db = router.db.getState();
  db.threads = db.threads.filter(
    (t) => t.thread_id !== req.params.threadId
  );
  db.messages = db.messages.filter(
    (m) => m.thread_id !== req.params.threadId
  );
  router.db.setState(db);
  res.status(204).end();
});

// --- CHAT STREAMING (SSE mock) ---
server.post("/threads/:threadId/runs/stream", (req, res) => {
  const db = router.db.getState();
  const thread = db.threads.find((t) => t.thread_id === req.params.threadId);
  const userMessage = req.body.input?.messages?.[0]?.content || "Hello";

  // Save user message
  const userMsg = {
    id: "msg-" + Date.now(),
    thread_id: req.params.threadId,
    role: "human",
    content: userMessage,
  };
  db.messages.push(userMsg);

  // Generate mock response
  const mockResponses = generateMockResponse(userMessage, thread);

  // Save assistant message
  const assistantMsg = {
    id: "msg-" + (Date.now() + 1),
    thread_id: req.params.threadId,
    role: "assistant",
    content: mockResponses.text,
    canvas: mockResponses.canvas,
  };
  db.messages.push(assistantMsg);

  // Update thread
  if (thread) {
    thread.message_count = db.messages.filter(
      (m) => m.thread_id === req.params.threadId
    ).length;
    thread.updated_at = new Date().toISOString();
    if (thread.message_count <= 2) {
      thread.title =
        userMessage.length > 50
          ? userMessage.substring(0, 50) + "..."
          : userMessage;
    }
  }
  router.db.setState(db);

  // SSE response
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Send thinking metadata, then stream text
  res.write(
    `event: metadata\ndata: ${JSON.stringify({
      run_id: "run-" + Date.now(),
      step: "thinking",
    })}\n\n`
  );

  // Start streaming text after a brief pause
  setTimeout(() => {
    const words = mockResponses.text.split(" ");
    let wordIdx = 0;
    const streamWord = () => {
      if (wordIdx < words.length) {
        const chunk = words[wordIdx] + (wordIdx < words.length - 1 ? " " : "");
        res.write(
          `event: updates\ndata: ${JSON.stringify({
            ops: [
              {
                op: "add",
                path: "/logs/ChatModel/streamed_output_str/-",
                value: chunk,
              },
            ],
          })}\n\n`
        );
        wordIdx++;
        setTimeout(streamWord, 30 + Math.random() * 40);
      } else {
        res.write(`event: end\ndata: null\n\n`);
        res.end();
      }
    };
    streamWord();
  }, 600);
});

function generateMockResponse(query, thread) {
  const q = query.toLowerCase();

  // Revenue / sales queries
  if (q.includes("revenue") || q.includes("sales") || q.includes("income")) {
    return {
      text: "I've analyzed the revenue data and created a comprehensive view with trends and detailed breakdown. The data shows a positive trajectory with some seasonal variations.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Revenue Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "text",
            title: "Key Findings",
            content:
              "## Revenue Analysis\n\n- **Total Revenue**: $4.2M (Last 6 months)\n- **Growth Rate**: +12.5% YoY\n- **Best Month**: January ($820K)\n- **Average Monthly**: $700K",
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "chart",
            title: "Revenue Trend",
            chartType: "area",
            data: {
              labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
              datasets: [
                {
                  name: "Revenue ($K)",
                  data: [580, 640, 720, 820, 760, 680],
                  color: "#3C4C73",
                },
                {
                  name: "Target ($K)",
                  data: [600, 650, 700, 750, 750, 750],
                  color: "#CF384D",
                },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-3",
            type: "table",
            title: "Monthly Revenue",
            columns: ["Month", "Revenue", "Orders", "Growth"],
            rows: [
              { Month: "Oct 2025", Revenue: "$580,000", Orders: 1842, Growth: "-2.1%" },
              { Month: "Nov 2025", Revenue: "$640,000", Orders: 2105, Growth: "+10.3%" },
              { Month: "Dec 2025", Revenue: "$720,000", Orders: 2460, Growth: "+12.5%" },
              { Month: "Jan 2026", Revenue: "$820,000", Orders: 2780, Growth: "+13.9%" },
              { Month: "Feb 2026", Revenue: "$760,000", Orders: 2510, Growth: "-7.3%" },
              { Month: "Mar 2026", Revenue: "$680,000", Orders: 2200, Growth: "-10.5%" },
            ],
          },
        ],
      },
    };
  }

  // Product queries
  if (q.includes("product") || q.includes("selling") || q.includes("inventory") || q.includes("stock")) {
    return {
      text: "Here's a detailed product analysis based on your database. I've included sales performance metrics and stock information.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Product Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "chart",
            title: "Top Products by Revenue",
            chartType: "bar",
            data: {
              labels: ["Smart Watch", "Earbuds", "Keyboard", "Webcam", "Monitor Light", "Laptop Stand"],
              datasets: [
                { name: "Revenue ($K)", data: [578, 136, 139, 123, 97, 94], color: "#3C4C73" },
                { name: "Units", data: [2890, 4520, 1980, 1750, 1620, 2340], color: "#CF384D" },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "table",
            title: "Product Details",
            columns: ["Product", "Category", "Price", "Units Sold", "Revenue", "Stock", "Rating"],
            rows: [
              { Product: "Smart Watch Pro", Category: "Electronics", Price: "$199.99", "Units Sold": 2890, Revenue: "$578,000", Stock: 340, Rating: "4.8" },
              { Product: "Wireless Earbuds", Category: "Electronics", Price: "$29.99", "Units Sold": 4520, Revenue: "$135,600", Stock: 1230, Rating: "4.7" },
              { Product: "Mechanical Keyboard", Category: "Electronics", Price: "$69.99", "Units Sold": 1980, Revenue: "$138,600", Stock: 560, Rating: "4.7" },
              { Product: "HD Webcam", Category: "Electronics", Price: "$69.99", "Units Sold": 1750, Revenue: "$122,500", Stock: 780, Rating: "4.5" },
              { Product: "Monitor Light Bar", Category: "Office", Price: "$59.99", "Units Sold": 1620, Revenue: "$97,200", Stock: 450, Rating: "4.6" },
              { Product: "Laptop Stand", Category: "Office", Price: "$39.99", "Units Sold": 2340, Revenue: "$93,600", Stock: 890, Rating: "4.6" },
            ],
          },
        ],
      },
    };
  }

  // Employee / HR queries
  if (q.includes("employee") || q.includes("turnover") || q.includes("department") || q.includes("salary") || q.includes("hr")) {
    return {
      text: "Here's the workforce analysis from the HR database. I've created visualizations showing departmental metrics and key HR indicators.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Workforce Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "chart",
            title: "Headcount by Department",
            chartType: "bar",
            data: {
              labels: ["Engineering", "Sales", "Support", "Marketing", "Operations", "Finance", "HR", "Legal"],
              datasets: [
                { name: "Headcount", data: [112, 89, 67, 45, 38, 28, 22, 15], color: "#3C4C73" },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "chart",
            title: "Satisfaction Scores",
            chartType: "line",
            data: {
              labels: ["Engineering", "Legal", "Finance", "HR", "Operations", "Marketing", "Sales", "Support"],
              datasets: [
                { name: "Score (out of 5)", data: [4.2, 4.1, 4.0, 3.9, 3.8, 3.6, 3.2, 3.1], color: "#16A34A" },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-3",
            type: "table",
            title: "Department Overview",
            columns: ["Department", "Headcount", "Avg Salary", "Turnover %", "Open Roles", "Satisfaction"],
            rows: [
              { Department: "Engineering", Headcount: 112, "Avg Salary": "$125,000", "Turnover %": "6.8%", "Open Roles": 15, Satisfaction: "4.2/5" },
              { Department: "Sales", Headcount: 89, "Avg Salary": "$85,000", "Turnover %": "22.5%", "Open Roles": 12, Satisfaction: "3.2/5" },
              { Department: "Support", Headcount: 67, "Avg Salary": "$55,000", "Turnover %": "18.7%", "Open Roles": 8, Satisfaction: "3.1/5" },
              { Department: "Marketing", Headcount: 45, "Avg Salary": "$78,000", "Turnover %": "16.3%", "Open Roles": 4, Satisfaction: "3.6/5" },
              { Department: "Operations", Headcount: 38, "Avg Salary": "$72,000", "Turnover %": "12.4%", "Open Roles": 2, Satisfaction: "3.8/5" },
              { Department: "Finance", Headcount: 28, "Avg Salary": "$95,000", "Turnover %": "9.8%", "Open Roles": 1, Satisfaction: "4.0/5" },
            ],
          },
        ],
      },
    };
  }

  // Customer queries
  if (q.includes("customer") || q.includes("user") || q.includes("acquisition")) {
    return {
      text: "Here's the customer analysis with acquisition metrics and segmentation data.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Customer Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "chart",
            title: "Customer Segments",
            chartType: "pie",
            data: {
              labels: ["Enterprise", "Mid-Market", "Small Business", "Consumer"],
              datasets: [
                { name: "Customers", data: [450, 1200, 3800, 29050], colors: ["#3C4C73", "#CF384D", "#16A34A", "#D97706"] },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "table",
            title: "Top Customers",
            columns: ["Customer", "Segment", "Lifetime Value", "Orders", "Last Order", "City"],
            rows: [
              { Customer: "Robert Wilson", Segment: "Enterprise", "Lifetime Value": "$34,500", Orders: 67, "Last Order": "Mar 9", City: "Seattle" },
              { Customer: "Michael Chen", Segment: "Enterprise", "Lifetime Value": "$23,400", Orders: 45, "Last Order": "Mar 8", City: "Chicago" },
              { Customer: "John Smith", Segment: "Enterprise", "Lifetime Value": "$12,500", Orders: 28, "Last Order": "Mar 7", City: "New York" },
              { Customer: "Sarah Johnson", Segment: "Mid-Market", "Lifetime Value": "$8,900", Orders: 22, "Last Order": "Mar 6", City: "San Francisco" },
              { Customer: "Emily Davis", Segment: "Small Business", "Lifetime Value": "$4,200", Orders: 12, "Last Order": "Mar 5", City: "Austin" },
            ],
          },
        ],
      },
    };
  }

  // Map / region / location queries
  if (q.includes("region") || q.includes("map") || q.includes("location") || q.includes("city") || q.includes("geograph")) {
    return {
      text: "Here's the geographic distribution analysis with an interactive map and regional breakdown.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Geographic Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "map",
            title: "Sales by City",
            mapType: "markers",
            locations: [
              { name: "New York", lat: 40.7128, lng: -74.006, value: 1250000, label: "$1.25M" },
              { name: "Los Angeles", lat: 34.0522, lng: -118.2437, value: 980000, label: "$980K" },
              { name: "Chicago", lat: 41.8781, lng: -87.6298, value: 720000, label: "$720K" },
              { name: "Houston", lat: 29.7604, lng: -95.3698, value: 540000, label: "$540K" },
              { name: "Miami", lat: 25.7617, lng: -80.1918, value: 560000, label: "$560K" },
              { name: "Dallas", lat: 32.7767, lng: -96.797, value: 470000, label: "$470K" },
            ],
            center: [39.8283, -98.5795],
            zoom: 4,
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "chart",
            title: "Revenue by Region",
            chartType: "bar",
            data: {
              labels: ["Northeast", "West Coast", "Southeast", "Southwest", "Midwest"],
              datasets: [
                { name: "Revenue ($K)", data: [1630, 1270, 1100, 770, 720], color: "#3C4C73" },
              ],
            },
          },
        ],
      },
    };
  }

  // Conversion / funnel queries
  if (q.includes("conversion") || q.includes("funnel") || q.includes("rate")) {
    return {
      text: "Here's the conversion funnel analysis from the Production Analytics database. The data shows conversion rates across each stage of the user journey over the last 30 days.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Conversion Funnel",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "chart",
            title: "Funnel Stages",
            chartType: "bar",
            data: {
              labels: ["Visitors", "Signups", "Activated", "Trial", "Paid", "Retained"],
              datasets: [
                { name: "Users", data: [48200, 12050, 7230, 3615, 1446, 1084], color: "#3C4C73" },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "table",
            title: "Stage Breakdown",
            columns: ["Stage", "Users", "Conversion", "Drop-off"],
            rows: [
              { Stage: "Visitors → Signup", Users: "12,050", Conversion: "25.0%", "Drop-off": "75.0%" },
              { Stage: "Signup → Activated", Users: "7,230", Conversion: "60.0%", "Drop-off": "40.0%" },
              { Stage: "Activated → Trial", Users: "3,615", Conversion: "50.0%", "Drop-off": "50.0%" },
              { Stage: "Trial → Paid", Users: "1,446", Conversion: "40.0%", "Drop-off": "60.0%" },
              { Stage: "Paid → Retained", Users: "1,084", Conversion: "75.0%", "Drop-off": "25.0%" },
            ],
          },
        ],
      },
    };
  }

  // Order / transaction queries
  if (q.includes("order") || q.includes("transaction") || q.includes("purchase")) {
    return {
      text: "Here's the order analysis from the Customer CRM database. I've broken down recent transactions by status, value, and timeline.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Order Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "chart",
            title: "Orders by Month",
            chartType: "area",
            data: {
              labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
              datasets: [
                { name: "Orders", data: [1842, 2105, 2460, 2780, 2510, 2200], color: "#3C4C73" },
                { name: "Avg Value ($)", data: [315, 304, 293, 295, 303, 309], color: "#CF384D" },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "table",
            title: "Recent Orders",
            columns: ["Order ID", "Customer", "Amount", "Items", "Status", "Date"],
            rows: [
              { "Order ID": "#ORD-4821", Customer: "Robert Wilson", Amount: "$1,250", Items: 3, Status: "Delivered", Date: "Mar 10" },
              { "Order ID": "#ORD-4820", Customer: "Sarah Johnson", Amount: "$890", Items: 2, Status: "Shipped", Date: "Mar 9" },
              { "Order ID": "#ORD-4819", Customer: "Michael Chen", Amount: "$2,340", Items: 5, Status: "Shipped", Date: "Mar 9" },
              { "Order ID": "#ORD-4818", Customer: "Emily Davis", Amount: "$445", Items: 1, Status: "Processing", Date: "Mar 8" },
              { "Order ID": "#ORD-4817", Customer: "James Brown", Amount: "$1,780", Items: 4, Status: "Delivered", Date: "Mar 8" },
            ],
          },
        ],
      },
    };
  }

  // Performance / metrics / dashboard queries
  if (q.includes("performance") || q.includes("metric") || q.includes("dashboard") || q.includes("overview") || q.includes("summary") || q.includes("kpi")) {
    return {
      text: "Here's a comprehensive performance overview pulling from multiple databases. Key metrics show healthy growth across most dimensions with some areas to monitor.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Performance Dashboard",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "text",
            title: "Key Metrics",
            content: "## Performance Summary (March 2026)\n\n| Metric | Value | vs Last Month |\n|--------|-------|---------------|\n| **MRR** | $284K | +8.2% |\n| **Active Users** | 12,450 | +5.1% |\n| **Churn Rate** | 3.2% | -0.4pp |\n| **NPS Score** | 72 | +3 |\n| **Avg Response Time** | 1.2s | -15% |",
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "chart",
            title: "Monthly Trends",
            chartType: "line",
            data: {
              labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
              datasets: [
                { name: "MRR ($K)", data: [218, 232, 248, 258, 262, 284], color: "#3C4C73" },
                { name: "Active Users (K)", data: [9.8, 10.2, 10.8, 11.4, 11.8, 12.4], color: "#16A34A" },
              ],
            },
          },
        ],
      },
    };
  }

  // Compare / comparison / vs / difference queries
  if (q.includes("compare") || q.includes("comparison") || q.includes(" vs ") || q.includes("difference") || q.includes("between")) {
    return {
      text: "Here's the comparison analysis you requested. I've organized the data side-by-side to highlight key differences and trends across the compared dimensions.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Comparison Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "chart",
            title: "Side-by-Side Comparison",
            chartType: "bar",
            data: {
              labels: ["Q1", "Q2", "Q3", "Q4"],
              datasets: [
                { name: "This Year", data: [420, 510, 480, 560], color: "#3C4C73" },
                { name: "Last Year", data: [380, 440, 460, 490], color: "#CF384D" },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "table",
            title: "Detailed Comparison",
            columns: ["Metric", "Current", "Previous", "Change", "Trend"],
            rows: [
              { Metric: "Revenue", Current: "$1.97M", Previous: "$1.77M", Change: "+11.3%", Trend: "Up" },
              { Metric: "Customers", Current: "34,500", Previous: "28,200", Change: "+22.3%", Trend: "Up" },
              { Metric: "Avg Order Value", Current: "$285", Previous: "$312", Change: "-8.7%", Trend: "Down" },
              { Metric: "Retention", Current: "82%", Previous: "79%", Change: "+3.8%", Trend: "Up" },
              { Metric: "Support Tickets", Current: "1,240", Previous: "1,580", Change: "-21.5%", Trend: "Down" },
            ],
          },
        ],
      },
    };
  }

  // Count / how many / total queries
  if (q.includes("how many") || q.includes("count") || q.includes("total") || q.includes("number of")) {
    const subject = q.replace(/how many|count|total|number of|are there|do we have|the|\?/gi, "").trim();
    return {
      text: `I've counted the ${subject || "records"} across the relevant database. Here's the breakdown with distribution details.`,
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Count Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "chart",
            title: "Distribution",
            chartType: "pie",
            data: {
              labels: ["Category A", "Category B", "Category C", "Other"],
              datasets: [
                { name: "Count", data: [4520, 3180, 2240, 1060], colors: ["#3C4C73", "#CF384D", "#16A34A", "#D97706"] },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "table",
            title: "Breakdown",
            columns: ["Category", "Count", "Percentage", "Growth"],
            rows: [
              { Category: "Category A", Count: "4,520", Percentage: "41.1%", Growth: "+12%" },
              { Category: "Category B", Count: "3,180", Percentage: "28.9%", Growth: "+8%" },
              { Category: "Category C", Count: "2,240", Percentage: "20.4%", Growth: "+15%" },
              { Category: "Other", Count: "1,060", Percentage: "9.6%", Growth: "-3%" },
            ],
          },
        ],
      },
    };
  }

  // Top / best / highest / lowest / worst queries
  if (q.includes("top") || q.includes("best") || q.includes("highest") || q.includes("lowest") || q.includes("worst") || q.includes("ranking")) {
    return {
      text: "Here's the ranking analysis based on your query. The results are sorted by the primary metric with additional context provided.",
      canvas: {
        id: "canvas-" + Date.now(),
        title: "Ranking Analysis",
        blocks: [
          {
            id: "b-" + Date.now() + "-1",
            type: "chart",
            title: "Top Rankings",
            chartType: "bar",
            data: {
              labels: ["#1 Alpha Corp", "#2 Beta Inc", "#3 Gamma Ltd", "#4 Delta Co", "#5 Epsilon LLC"],
              datasets: [
                { name: "Score", data: [95.2, 88.7, 82.4, 76.1, 71.8], color: "#3C4C73" },
              ],
            },
          },
          {
            id: "b-" + Date.now() + "-2",
            type: "table",
            title: "Detailed Rankings",
            columns: ["Rank", "Name", "Primary Metric", "Secondary", "Trend", "Since"],
            rows: [
              { Rank: 1, Name: "Alpha Corp", "Primary Metric": "95.2", Secondary: "$2.4M", Trend: "+5.2%", Since: "2024" },
              { Rank: 2, Name: "Beta Inc", "Primary Metric": "88.7", Secondary: "$1.8M", Trend: "+12.1%", Since: "2023" },
              { Rank: 3, Name: "Gamma Ltd", "Primary Metric": "82.4", Secondary: "$1.5M", Trend: "-2.3%", Since: "2024" },
              { Rank: 4, Name: "Delta Co", "Primary Metric": "76.1", Secondary: "$1.2M", Trend: "+8.6%", Since: "2025" },
              { Rank: 5, Name: "Epsilon LLC", "Primary Metric": "71.8", Secondary: "$980K", Trend: "+3.1%", Since: "2024" },
            ],
          },
        ],
      },
    };
  }

  // Default — echo the user's query back with relevant context
  const shortQuery = query.length > 60 ? query.substring(0, 60) + "..." : query;
  return {
    text: `I ran your query against the Production Analytics database and found some interesting results. Here's a summary based on "${shortQuery}".`,
    canvas: {
      id: "canvas-" + Date.now(),
      title: "Query Results",
      blocks: [
        {
          id: "b-" + Date.now() + "-1",
          type: "text",
          title: "Analysis",
          content:
            "## Query Results\n\nI processed your request and found the following key insights:\n\n- **Total records analyzed**: 125,430\n- **Time range**: Last 6 months\n- **Data quality**: 99.2% complete\n\nThe results are shown in the table below. You can sort and filter the data as needed.",
        },
        {
          id: "b-" + Date.now() + "-2",
          type: "chart",
          title: "Data Overview",
          chartType: "line",
          data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
            datasets: [
              { name: "Metric A", data: [120, 135, 148, 142, 156, 163, 158, 172], color: "#3C4C73" },
              { name: "Metric B", data: [85, 92, 88, 95, 102, 98, 108, 115], color: "#CF384D" },
            ],
          },
        },
        {
          id: "b-" + Date.now() + "-3",
          type: "table",
          title: "Results",
          columns: ["ID", "Name", "Category", "Value", "Change", "Status"],
          rows: [
            { ID: 1, Name: "Item Alpha", Category: "Type A", Value: "$12,500", Change: "+15.2%", Status: "Active" },
            { ID: 2, Name: "Item Beta", Category: "Type B", Value: "$9,800", Change: "+8.7%", Status: "Active" },
            { ID: 3, Name: "Item Gamma", Category: "Type A", Value: "$7,300", Change: "-3.1%", Status: "Review" },
            { ID: 4, Name: "Item Delta", Category: "Type C", Value: "$6,100", Change: "+22.4%", Status: "Active" },
            { ID: 5, Name: "Item Epsilon", Category: "Type B", Value: "$4,900", Change: "+5.6%", Status: "Active" },
          ],
        },
      ],
    },
  };
}

// --- METADATA ---

// Helper: infer a normalized type from a SQL type string
function inferNormalizedType(sqlType) {
  const t = (sqlType || "").toLowerCase();
  if (t.includes("int") || t.includes("serial")) return "integer";
  if (t.includes("decimal") || t.includes("numeric") || t.includes("float") || t.includes("double") || t.includes("real")) return "decimal";
  if (t.includes("bool")) return "boolean";
  if (t.includes("timestamp") || t.includes("datetime")) return "datetime";
  if (t.includes("date")) return "date";
  if (t.includes("time")) return "time";
  if (t.includes("json")) return "json";
  if (t.includes("text") || t.includes("varchar") || t.includes("char")) return "text";
  return "unknown";
}

// Helper: transform raw db.json table schema into the shape components expect (TableSchema)
function transformSchema(raw, tableName) {
  const primaryKeys = [];
  const foreignKeys = [];
  const columns = (raw.columns || []).map((col) => {
    if (col.primary_key) primaryKeys.push(col.name);
    if (col.foreign_key) {
      const [refTable, refCol] = col.foreign_key.split(".");
      foreignKeys.push({ column: col.name, referenced_table: refTable, referenced_column: refCol });
    }
    return {
      name: col.name,
      data_type: col.type,
      normalized_type: inferNormalizedType(col.type),
      nullable: col.nullable,
      is_primary_key: !!col.primary_key,
      is_foreign_key: !!col.foreign_key,
      comment: col.description || undefined,
    };
  });
  return {
    name: raw.table_name || tableName,
    schema_name: raw.schema || "public",
    table_type: "table",
    row_count: raw.row_count || 0,
    columns,
    primary_key: primaryKeys,
    foreign_keys: foreignKeys,
    indexes: (raw.indexes || []).map((idx) => ({
      name: idx.name,
      columns: idx.columns,
      is_unique: !!idx.unique,
    })),
  };
}

server.get("/api/v1/metadata/tables", (req, res) => {
  const db = router.db.getState();
  const connectionId = req.query.connection_id;
  const rawTables = db.tables[connectionId] || [];
  // Transform to TableInfo shape
  const tables = rawTables.map((t) => ({
    name: t.name,
    schema_name: t.schema || "public",
    table_type: t.type || "table",
    row_count_estimate: t.row_count,
    size_bytes: t.size_mb ? Math.round(t.size_mb * 1024 * 1024) : undefined,
    comment: t.description,
  }));
  res.json(tables);
});

server.get("/api/v1/metadata/tables/relationships", (req, res) => {
  const connectionId = req.query.connection_id;
  const db = router.db.getState();
  const rawTables = db.tables[connectionId] || [];
  // Build relationships from foreign keys in table schemas
  const rels = [];
  for (const t of rawTables) {
    const key = connectionId + "__" + t.name;
    const schema = db.table_schemas[key];
    if (schema) {
      for (const col of schema.columns || []) {
        if (col.foreign_key) {
          const [refTable, refCol] = col.foreign_key.split(".");
          rels.push({
            from_table: t.name,
            from_column: col.name,
            to_table: refTable,
            to_column: refCol,
            relationship_type: "explicit_fk",
            confidence: 1.0,
            cardinality: "one_to_many",
          });
        }
      }
    }
  }
  res.json(rels);
});

server.get("/api/v1/metadata/tables/:tableName/sample", (req, res) => {
  const db = router.db.getState();
  const connectionId = req.query.connection_id;
  const key = connectionId + "__" + req.params.tableName;
  const rows = db.sample_data[key] || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  res.json({
    table: req.params.tableName,
    columns,
    data: rows,
    total_rows: rows.length,
  });
});

server.get("/api/v1/metadata/tables/:tableName", (req, res) => {
  const db = router.db.getState();
  const connectionId = req.query.connection_id;
  const key = connectionId + "__" + req.params.tableName;
  const rawSchema = db.table_schemas[key];
  if (!rawSchema) {
    // Fallback generic schema
    return res.json(transformSchema({
      table_name: req.params.tableName,
      schema: "public",
      columns: [
        { name: "id", type: "integer", nullable: false, primary_key: true },
        { name: "name", type: "varchar(255)", nullable: false },
        { name: "created_at", type: "timestamp", nullable: false },
      ],
      row_count: 1000,
    }, req.params.tableName));
  }
  res.json(transformSchema(rawSchema, req.params.tableName));
});

server.post("/api/v1/metadata/refresh", (req, res) => {
  setTimeout(() => res.json({ success: true, tables_refreshed: 12 }), 1500);
});

// --- INTROSPECTION ---
server.get("/api/v1/connections/:connId/introspect/status", (req, res) => {
  const db = router.db.getState();
  const status = db.introspection[req.params.connId];
  if (!status) {
    return res.json({ status: "not_started", progress: 0 });
  }
  res.json(status);
});

server.post("/api/v1/connections/:connId/introspect", (req, res) => {
  res.json({ status: "in_progress", progress: 0 });
});

server.get("/api/v1/connections/:connId/introspect/metadata", (req, res) => {
  const db = router.db.getState();
  const connId = req.params.connId;
  const rawTables = db.tables[connId] || [];
  const totalRows = rawTables.reduce((s, t) => s + (t.row_count || 0), 0);
  const totalSizeMb = rawTables.reduce((s, t) => s + (t.size_mb || 0), 0);

  // Build column type distribution from schemas
  const typeCounts = {};
  let totalCols = 0;
  const nullableColumns = [];
  for (const t of rawTables) {
    const key = connId + "__" + t.name;
    const schema = db.table_schemas[key];
    if (schema) {
      for (const col of schema.columns || []) {
        totalCols++;
        const nt = inferNormalizedType(col.type);
        typeCounts[nt] = (typeCounts[nt] || 0) + 1;
        if (col.nullable) {
          nullableColumns.push({ table: t.name, column: col.name, type: col.type });
        }
      }
    }
  }

  res.json({
    connection_id: connId,
    table_count: rawTables.length,
    total_columns: totalCols,
    total_rows: totalRows,
    total_size_bytes: Math.round(totalSizeMb * 1024 * 1024),
    column_type_distribution: typeCounts,
    top_tables_by_size: rawTables
      .sort((a, b) => (b.size_mb || 0) - (a.size_mb || 0))
      .slice(0, 5)
      .map((t) => ({ name: t.name, row_count: t.row_count, size_bytes: Math.round((t.size_mb || 0) * 1024 * 1024) })),
    nullable_columns: nullableColumns,
    generated_at: new Date().toISOString(),
  });
});

server.get("/api/v1/connections/:connId/validated-examples", (req, res) => {
  const connId = req.params.connId;
  res.json([
    {
      id: "ex-1",
      title: "Monthly Revenue Trend",
      description: "Shows revenue aggregated by month for the last 12 months",
      user_intent: "What is the monthly revenue trend?",
      block_type: "table",
      sql_query: "SELECT DATE_TRUNC('month', order_date) AS month, SUM(total_amount) AS revenue FROM orders GROUP BY 1 ORDER BY 1 DESC LIMIT 12",
      output: {
        columns: ["month", "revenue"],
        data: [
          { month: "2026-03", revenue: 245000 },
          { month: "2026-02", revenue: 312000 },
          { month: "2026-01", revenue: 289000 },
          { month: "2025-12", revenue: 356000 },
          { month: "2025-11", revenue: 298000 },
        ],
      },
    },
    {
      id: "ex-2",
      title: "Top Customers by Lifetime Value",
      description: "Ranked list of customers with highest lifetime value",
      user_intent: "Who are our top customers?",
      block_type: "table",
      sql_query: "SELECT name, email, segment, lifetime_value FROM customers ORDER BY lifetime_value DESC LIMIT 10",
      output: {
        columns: ["name", "email", "segment", "lifetime_value"],
        data: [
          { name: "Robert Wilson", email: "rwilson@dataflow.com", segment: "enterprise", lifetime_value: 34500 },
          { name: "Michael Chen", email: "mchen@globalretail.com", segment: "enterprise", lifetime_value: 23400 },
          { name: "John Smith", email: "john@acmecorp.com", segment: "enterprise", lifetime_value: 12500 },
        ],
      },
    },
    {
      id: "ex-3",
      title: "Order Status Distribution",
      description: "Breakdown of orders by their current status",
      user_intent: "Show order status distribution",
      block_type: "python",
      sql_query: "SELECT status, COUNT(*) as count FROM orders GROUP BY status",
      code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame(data)\ndf.plot.pie(y='count', labels=df['status'])\nplt.title('Order Status Distribution')",
    },
    {
      id: "ex-4",
      title: "Payment Method Analysis",
      description: "Revenue breakdown by payment method",
      user_intent: "Compare revenue by payment method",
      block_type: "table",
      sql_query: "SELECT payment_method, COUNT(*) AS orders, SUM(total_amount) AS total_revenue FROM orders GROUP BY payment_method ORDER BY total_revenue DESC",
      output: {
        columns: ["payment_method", "orders", "total_revenue"],
        data: [
          { payment_method: "credit_card", orders: 78250, total_revenue: 8945000 },
          { payment_method: "paypal", orders: 31200, total_revenue: 3120000 },
          { payment_method: "bank_transfer", orders: 15980, total_revenue: 2890000 },
        ],
      },
    },
  ]);
});

server.get("/api/v1/connections/:connId/prompts", (req, res) => {
  res.json([
    {
      id: "system_prompt",
      key: "SYSTEM_PROMPT",
      type: "system",
      title: "System Prompt",
      text: "You are an AI data analyst assistant. You help users explore and analyze their database by writing SQL queries, creating visualizations, and providing insights. Always explain your reasoning and suggest follow-up analyses.",
    },
    {
      id: "analysis_prompt",
      key: "ANALYSIS_PROMPT",
      type: "analysis",
      title: "Analysis Prompt",
      text: "When analyzing data, consider statistical significance, trends over time, and anomalies. Present findings in a clear, actionable format with supporting evidence from the data.",
    },
    {
      id: "sql_generation",
      key: "SQL_GENERATION_PROMPT",
      type: "system",
      title: "SQL Generation Prompt",
      text: "Generate efficient, well-formatted SQL queries. Use CTEs for complex logic, appropriate JOINs, and always include relevant WHERE clauses. Add comments for complex sections. Prefer explicit column names over SELECT *.",
    },
    {
      id: "visualization_prompt",
      key: "VISUALIZATION_PROMPT",
      type: "analysis",
      title: "Visualization Prompt",
      text: "Choose the most appropriate chart type for the data. Use clear labels, legends, and titles. Consider color accessibility. For time series use line charts, for comparisons use bar charts, for proportions use pie/donut charts.",
    },
  ]);
});

server.patch("/api/v1/connections/:connId/prompts/:promptId", (req, res) => {
  res.json({ success: true, id: req.params.promptId, text: req.body.text });
});

// --- SUGGESTIONS ---
server.get("/api/v1/connections/:connId/suggestions", (req, res) => {
  const db = router.db.getState();
  res.json(db.suggestions[req.params.connId] || []);
});

// --- DASHBOARDS ---
server.get("/api/v1/dashboards", (req, res) => {
  const db = router.db.getState();
  res.json(db.dashboards);
});

server.get("/api/v1/dashboards/:id", (req, res) => {
  const db = router.db.getState();
  const dash = db.dashboards.find((d) => d.id === req.params.id);
  if (!dash) return res.status(404).json({ detail: "Not found" });
  res.json(dash);
});

server.post("/api/v1/dashboards", (req, res) => {
  const db = router.db.getState();
  const newDash = {
    id: "dash-" + (db.dashboards.length + 1),
    ...req.body,
    widgets: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.dashboards.push(newDash);
  router.db.setState(db);
  res.status(201).json(newDash);
});

server.delete("/api/v1/dashboards/:id", (req, res) => {
  const db = router.db.getState();
  db.dashboards = db.dashboards.filter((d) => d.id !== req.params.id);
  router.db.setState(db);
  res.status(204).end();
});

server.post("/api/v1/dashboards/:id/widgets", (req, res) => {
  const db = router.db.getState();
  const dash = db.dashboards.find((d) => d.id === req.params.id);
  if (!dash) return res.status(404).json({ detail: "Not found" });
  dash.widgets = dash.widgets || [];
  const widget = {
    id: "widget-" + Date.now(),
    position_x: 0,
    position_y: (dash.widgets.length || 0) * 4,
    grid_width: 6,
    grid_height: 4,
    ...req.body,  // body AFTER defaults so frontend values win
  };
  widget.id = "widget-" + Date.now(); // always generate server-side ID
  dash.widgets.push(widget);
  router.db.setState(db);
  res.status(201).json(widget);
});

server.patch("/api/v1/dashboards/:dashId/widgets/:widgetId", (req, res) => {
  const db = router.db.getState();
  const dash = db.dashboards.find((d) => d.id === req.params.dashId);
  if (!dash) return res.status(404).json({ detail: "Dashboard not found" });
  const widget = (dash.widgets || []).find((w) => w.id === req.params.widgetId);
  if (!widget) return res.status(404).json({ detail: "Widget not found" });
  Object.assign(widget, req.body);
  router.db.setState(db);
  res.json(widget);
});

server.delete("/api/v1/dashboards/:dashId/widgets/:widgetId", (req, res) => {
  const db = router.db.getState();
  const dash = db.dashboards.find((d) => d.id === req.params.dashId);
  if (dash) {
    dash.widgets = (dash.widgets || []).filter(
      (w) => w.id !== req.params.widgetId
    );
    router.db.setState(db);
  }
  res.status(204).end();
});

// --- COLLECTIONS ---
server.get("/api/v1/collections", (req, res) => {
  const db = router.db.getState();
  res.json(db.collections);
});

server.get("/api/v1/collections/:id", (req, res) => {
  const db = router.db.getState();
  const col = db.collections.find((c) => c.id === req.params.id);
  if (!col) return res.status(404).json({ detail: "Not found" });
  // Populate threads
  const threads = db.threads.filter((t) =>
    col.thread_ids.includes(t.thread_id)
  );
  res.json({ ...col, threads });
});

server.post("/api/v1/collections", (req, res) => {
  const db = router.db.getState();
  const newCol = {
    id: "col-" + (db.collections.length + 1),
    ...req.body,
    thread_ids: req.body.thread_ids || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.collections.push(newCol);
  router.db.setState(db);
  res.status(201).json(newCol);
});

server.put("/api/v1/collections/:id", (req, res) => {
  const db = router.db.getState();
  const idx = db.collections.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ detail: "Not found" });
  db.collections[idx] = {
    ...db.collections[idx],
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  router.db.setState(db);
  res.json(db.collections[idx]);
});

server.delete("/api/v1/collections/:id", (req, res) => {
  const db = router.db.getState();
  db.collections = db.collections.filter((c) => c.id !== req.params.id);
  router.db.setState(db);
  res.status(204).end();
});

// --- CANVAS HISTORY ---
server.get("/api/v1/canvas-history/:threadId", (req, res) => {
  res.json([
    {
      id: "v1",
      version: 1,
      title: "Initial result",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "v2",
      version: 2,
      title: "Updated with chart",
      created_at: new Date().toISOString(),
    },
  ]);
});

// Start
const PORT = 8000;
server.listen(PORT, () => {
  console.log(`\n  Mock API server running at http://localhost:${PORT}`);
  console.log(`  Login: admin/admin123 or demo/demo123\n`);
});
