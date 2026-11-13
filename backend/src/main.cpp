#include "crow.h"
#include "crow/middlewares/cors.h"
#include <algorithm>
#include <cctype>
#include <cstdlib>
#include <ctime>
#include <iomanip>
#include <iostream>
#include <map>
#include <mutex>
#include <sstream>
#include <string>
#include <vector>

struct MenuItem
{
    int id;
    std::string name;
    std::string description;
    std::string category;
    double price;
    std::string image;
    std::string tag;
};

struct ReceiptLine
{
    std::string name;
    int quantity;
    double unitPrice;
    double lineTotal;
};

struct Receipt
{
    std::string id;
    std::string customerName;
    std::vector<ReceiptLine> items;
    double subtotal = 0.0;
    double tax = 0.0;
    double total = 0.0;
    double taxRate = 0.05;
    std::string createdAt;
};

const double TAX_RATE = 0.05; // Change this if your instructor specifies another rate.

std::vector<MenuItem> menuItems = {
    {1, "Truffle Mushroom Toast", "Wild mushrooms, whipped ricotta, herbs & sourdough.", "Small Plates", 690, "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&q=85", "Guest favourite"},
    {2, "Burrata Garden Salad", "Creamy burrata, heirloom tomatoes, basil oil.", "Small Plates", 850, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=85", "Fresh"},
    {3, "The Maison Smash", "Double beef patty, aged cheddar, house sauce, brioche.", "Mains", 1250, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85", "Bestseller"},
    {4, "Creamy Tuscan Pasta", "Penne, parmesan cream, sun-dried tomato & spinach.", "Mains", 1100, "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=85", ""},
    {5, "Herb Roast Chicken", "Lemon butter, rosemary jus, seasonal vegetables.", "Mains", 1450, "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900&q=85", ""},
    {6, "Saffron Citrus Cooler", "Fresh citrus, saffron syrup, mint & sparkling water.", "Drinks", 420, "https://images.unsplash.com/photo-1513558161293-c1e634a6f025?w=900&q=85", "Refreshing"},
    {7, "Iced Spanish Latte", "Double espresso, silky milk, a little sweetness.", "Drinks", 480, "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&q=85", ""},
    {8, "Dark Chocolate Tart", "Bittersweet ganache, flaky pastry, vanilla cream.", "Desserts", 620, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85", "A little indulgence"}};

std::map<std::string, Receipt> receipts;
std::mutex receiptsMutex;
int nextReceiptNumber = 1001;

void addCors(crow::response &res)
{
    // For a classroom demo. In production, replace "*" with your exact frontend origin.
    res.add_header("Access-Control-Allow-Origin", "*");
    res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.add_header("Access-Control-Allow-Headers", "Content-Type");
}

crow::response jsonResponse(int status, const crow::json::wvalue &body)
{
    crow::response res(status);
    res.set_header("Content-Type", "application/json");
    addCors(res);
    res.body = body.dump();
    return res;
}

crow::json::wvalue menuItemToJson(const MenuItem &item)
{
    crow::json::wvalue json;
    json["id"] = item.id;
    json["name"] = item.name;
    json["description"] = item.description;
    json["category"] = item.category;
    json["price"] = item.price;
    json["image"] = item.image;
    json["tag"] = item.tag;
    return json;
}

std::string currentTime()
{
    const std::time_t now = std::time(nullptr);
    std::tm *local = std::localtime(&now);
    std::ostringstream out;
    out << std::put_time(local, "%Y-%m-%dT%H:%M:%S");
    return out.str();
}

crow::json::wvalue receiptToJson(const Receipt &receipt)
{
    crow::json::wvalue result;
    result["id"] = receipt.id;
    result["customerName"] = receipt.customerName;
    result["subtotal"] = receipt.subtotal;
    result["tax"] = receipt.tax;
    result["taxRate"] = receipt.taxRate;
    result["total"] = receipt.total;
    result["createdAt"] = receipt.createdAt;

    crow::json::wvalue::list lines;
    for (const auto &line : receipt.items)
    {
        crow::json::wvalue row;
        row["name"] = line.name;
        row["quantity"] = line.quantity;
        row["unitPrice"] = line.unitPrice;
        row["lineTotal"] = line.lineTotal;
        lines.push_back(std::move(row));
    }
    result["items"] = std::move(lines);
    return result;
}

int main()
{
    crow::App<crow::CORSHandler> app;
    auto &cors = app.get_middleware<crow::CORSHandler>();

    cors.global()
        .origin("*")
        .methods(
            crow::HTTPMethod::GET,
            crow::HTTPMethod::POST,
            crow::HTTPMethod::OPTIONS)
        .headers("Content-Type");
    CROW_ROUTE(app, "/")([]
                         { return "Maison Restaurant API is running. Try /api/health or /api/menu."; });

    CROW_ROUTE(app, "/api/health")
        .methods(crow::HTTPMethod::GET, crow::HTTPMethod::OPTIONS)([](const crow::request &req)
                                                                   {
        if (req.method == crow::HTTPMethod::OPTIONS) {
            crow::response res(204);
            addCors(res);
            return res;
        }
        crow::json::wvalue body;
        body["status"] = "ok";
        body["service"] = "maison-restaurant-cpp-api";
        return jsonResponse(200, body); });

    CROW_ROUTE(app, "/api/menu")
        .methods(crow::HTTPMethod::GET, crow::HTTPMethod::OPTIONS)([](const crow::request &req)
                                                                   {
        if (req.method == crow::HTTPMethod::OPTIONS) {
            crow::response res(204);
            addCors(res);
            return res;
        }

        const char* searchParam = req.url_params.get("search");
        const char* categoryParam = req.url_params.get("category");
        const std::string search = searchParam ? searchParam : "";
        const std::string category = categoryParam ? categoryParam : "";

        std::string loweredSearch = search;
        std::transform(loweredSearch.begin(), loweredSearch.end(), loweredSearch.begin(),
            [](unsigned char c) { return static_cast<char>(std::tolower(c)); });

        crow::json::wvalue::list items;
        for (const auto& item : menuItems) {
            std::string searchable = item.name + " " + item.description + " " + item.category;
            std::transform(searchable.begin(), searchable.end(), searchable.begin(),
                [](unsigned char c) { return static_cast<char>(std::tolower(c)); });

            const bool matchesSearch = loweredSearch.empty() || searchable.find(loweredSearch) != std::string::npos;
            const bool matchesCategory = category.empty() || category == "All" || item.category == category;
            if (matchesSearch && matchesCategory) items.push_back(menuItemToJson(item));
        }

        const int resultCount = static_cast<int>(items.size());
        crow::json::wvalue body;
        body["items"] = std::move(items);
        body["count"] = resultCount;
        return jsonResponse(200, body); });

    CROW_ROUTE(app, "/api/orders")
        .methods(crow::HTTPMethod::POST, crow::HTTPMethod::OPTIONS)([](const crow::request &req)
                                                                    {
        if (req.method == crow::HTTPMethod::OPTIONS) {
            crow::response res(204);
            addCors(res);
            return res;
        }

        const auto body = crow::json::load(req.body);
        if (!body || !body.has("items") || body["items"].t() != crow::json::type::List) {
            crow::json::wvalue error;
            error["error"] = "Invalid order. Expected an items array.";
            return jsonResponse(400, error);
        }

        Receipt receipt;
        receipt.customerName = body.has("customerName") ? std::string(body["customerName"].s()) : std::string("Walk-in Guest");
        if (receipt.customerName.empty()) receipt.customerName = "Walk-in Guest";
        receipt.taxRate = TAX_RATE;
        receipt.createdAt = currentTime();

        for (const auto& requested : body["items"]) {
            if (!requested.has("menuItemId") || !requested.has("quantity")) {
                crow::json::wvalue error;
                error["error"] = "Each order item needs menuItemId and quantity.";
                return jsonResponse(400, error);
            }

            const int id = requested["menuItemId"].i();
            const int quantity = requested["quantity"].i();
            if (quantity < 1 || quantity > 99) {
                crow::json::wvalue error;
                error["error"] = "Quantity must be between 1 and 99.";
                return jsonResponse(400, error);
            }

            const auto found = std::find_if(menuItems.begin(), menuItems.end(),
                [id](const MenuItem& item) { return item.id == id; });

            if (found == menuItems.end()) {
                crow::json::wvalue error;
                error["error"] = "A selected menu item does not exist.";
                return jsonResponse(400, error);
            }

            const double lineTotal = found->price * quantity;
            receipt.items.push_back({found->name, quantity, found->price, lineTotal});
            receipt.subtotal += lineTotal;
        }

        if (receipt.items.empty()) {
            crow::json::wvalue error;
            error["error"] = "Your order is empty.";
            return jsonResponse(400, error);
        }

        receipt.tax = receipt.subtotal * receipt.taxRate;
        receipt.total = receipt.subtotal + receipt.tax;

        {
            std::lock_guard<std::mutex> lock(receiptsMutex);
            receipt.id = "MSN-" + std::to_string(nextReceiptNumber++);
            receipts[receipt.id] = receipt;
        }

        crow::json::wvalue response;
        response["message"] = "Order created successfully.";
        response["receipt"] = receiptToJson(receipt);
        return jsonResponse(201, response); });

    CROW_ROUTE(app, "/api/receipts/<string>")
        .methods(crow::HTTPMethod::GET, crow::HTTPMethod::OPTIONS)([](const crow::request &req, const std::string &id)
                                                                   {
        if (req.method == crow::HTTPMethod::OPTIONS) {
            crow::response res(204);
            addCors(res);
            return res;
        }

        std::lock_guard<std::mutex> lock(receiptsMutex);
        const auto found = receipts.find(id);
        if (found == receipts.end()) {
            crow::json::wvalue error;
            error["error"] = "Receipt not found. Receipts are stored in memory for this demo session.";
            return jsonResponse(404, error);
        }

        crow::json::wvalue response;
        response["receipt"] = receiptToJson(found->second);
        return jsonResponse(200, response); });

    const char *portEnv = std::getenv("PORT");
    const int port = portEnv ? std::stoi(portEnv) : 18080;
    app.port(static_cast<std::uint16_t>(port)).multithreaded().bindaddr("0.0.0.0").run();
    return 0;
}
