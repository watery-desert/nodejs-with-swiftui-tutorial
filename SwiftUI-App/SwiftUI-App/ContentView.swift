
import SwiftUI


struct ErrorData : Codable {
    var message: String
    
    enum CodingKeys: String, CodingKey {
        case message
    }
}

struct Todos : Codable {
    var message: String
    var todos: [Todo]
    
    enum CodingKeys: String, CodingKey {
        case message
        case todos
    }
}

struct Todo :Identifiable, Codable {
    var id: String?
    var task: String
    var isDone: Bool
    
    
    enum CodingKeys: String, CodingKey {
        case id
        case task
        case isDone
        
    }
}

struct TodoHome: View {
    
    @State private var todos: [Todo] = []
    @State private var showSheet = false
    @State private var showError = false
    @State private var selectedTodo: Todo?

    
    var body: some View {
        NavigationView {
            Group {
                if todos.isEmpty {
                    Text("Empty")
                } else  {
                    List {
                        ForEach(todos) { todo in
                            HStack {
                                Text(todo.task)
                                Spacer()
                                
                                Image(systemName:  todo.isDone ? "checkmark.circle" : "circle")
                                    .foregroundColor(.green)
                            }
                            .contentShape(Rectangle())
                            .onTapGesture {
                                selectedTodo = todo
                            }
                        }
                        
                        .onDelete(perform: { indexSet in
                            indexSet.forEach { index in
                                let id = todos[index].id
                                Task {
                                    do {
                                        try  await deleteTodo(id!)
                                    } catch {
                                        print(error)
                                    }
                                }
                            }
                            
                        })
                    }
                }
            }
            .sheet(item: $selectedTodo) { todo in
                SheetView(todo, $showError) { task, isDone, dismiss in
                    Task {
                        do {
                            try await patchTodo(todo: Todo(id: todo.id, task: task, isDone: isDone))
                            dismiss()
                        } catch {
                            showError = true
                        }
                    }
                }
            }
            .navigationTitle("ToDos")
            .toolbar {
                Button("Add") {
                    showSheet = true
                }
            }
            
            
        }.sheet(isPresented: $showSheet) {
            
            SheetView ($showError) { task, isDone, _ in
                Task {
                    do {
                        try await postTodo(todo: Todo(task: task, isDone: isDone))
                        showSheet = false

                    } catch {
                        showError = true
                    }
                }
            }
        }
        
        .alert(isPresented: $showError) {
            Alert(title: Text("Failed to load"),
                  dismissButton: .default(Text("OK"))
            )
        }
        
        .task  {
            do {
                try  await getTodos()
            } catch {
                showError = true
                print(error.localizedDescription)
                
            }
            
        }
    }
    
    
    func getTodos() async throws {
        let url = URL(string: "http://localhost:8000/todo/todos")!
         
         var urlRequest = URLRequest(url: url)
         urlRequest.httpMethod = "GET"
   
         let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
         guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
             let errorData = try JSONDecoder().decode(ErrorData.self, from: data).message
             print("Error \(errorData)")
             throw URLError(.cannotParseResponse)
         }
         
         let jsonData =  try JSONDecoder().decode(Todos.self, from: data)
         print(jsonData.message)
         todos.append(contentsOf: jsonData.todos)
    }
    
    
    func postTodo(todo: Todo) async throws {
        let url = URL(string: "http://localhost:8000/todo/todo")!
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        guard let encodedTodo = try? JSONEncoder().encode(todo) else {
            return
        }
        let (data, response) = try await URLSession.shared.upload(for: urlRequest, from: encodedTodo)
        guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
            let errorData = try JSONDecoder().decode(ErrorData.self, from: data).message
            
            print("Error \(errorData)")
            throw URLError(.cannotParseResponse)
        }
        
        
        let jsonData =  try JSONDecoder().decode(Todos.self, from: data)
        print(jsonData.message)
        todos = jsonData.todos
    }
    
    
    func patchTodo(todo: Todo) async throws {
        let url = URL(string: "http://localhost:8000/todo/\(todo.id!)")!
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "PATCH"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        guard let encodedTodo = try? JSONEncoder().encode(todo) else {
            return
        }
        let (data, response) = try await URLSession.shared.upload(for: urlRequest, from: encodedTodo)
        guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
            let errorData = try JSONDecoder().decode(ErrorData.self, from: data).message
            
            print("Error \(errorData)")
            
            throw URLError(.cannotParseResponse)
        }
        
        let jsonData =  try JSONDecoder().decode(Todos.self, from: data)
        print(jsonData.message)
        todos = jsonData.todos
    }
    
    func deleteTodo(_ id: String) async throws {
        let url = URL(string: "http://localhost:8000/todo/\(id)")!
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "DELETE"
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
            let errorData = try JSONDecoder().decode(ErrorData.self, from: data).message

            print("Error \(errorData)")
            throw URLError(.cannotParseResponse)
        }
        let jsonData =  try JSONDecoder().decode(Todos.self, from: data)
        print(jsonData.message)
        todos = jsonData.todos
    }
    
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        TodoHome()
    }
}


typealias OnTap = (String, Bool, DismissAction) -> Void

struct SheetView: View {
    
    @Environment(\.dismiss) private var dismiss
    @Binding private var showError: Bool
    @State private var text: String = ""
    @State private var isDone : Bool = false
    private let onTapSave:  OnTap
    private let todo: Todo?

    init(_ todo: Todo, _ showError: Binding<Bool> ,  onTapSave: @escaping OnTap) {
        self._showError = showError
        self.onTapSave = onTapSave
        self.todo = todo
    }

    init(_ showError: Binding<Bool> , onTapSave: @escaping OnTap) {
        self._showError = showError
        self.onTapSave = onTapSave
        self.todo = nil
    }


   
    
    var body: some View {
        
        Form {
            
            TextField("Enter your task", text: $text)
            Picker("Done?", selection: $isDone) {
                Text("Done").tag(true)
                Text("Not Done").tag(false)
            }
            .pickerStyle(.segmented)
            
        }
        .onAppear {
            Task {
                self.text = todo?.task ?? ""
                self.isDone = todo?.isDone ?? false
            }
        }
        
        Button {
            onTapSave(text, isDone, dismiss)
        } label: {
            Text("Save")
                .foregroundColor(.black)
                .font(.system(size: 20, weight: .bold))
                .frame(width: 200, height: 48)
                .background(.yellow)
                .cornerRadius(16)
                .padding()
        }
        
        .alert(isPresented: $showError) {
            Alert(title: Text("Failed to load"),
                  message: Text("Something wrong with the server"),
                  dismissButton: .default(Text("OK")))
        }
    }
}



