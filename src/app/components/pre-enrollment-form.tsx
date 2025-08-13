"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

// Schema de validação
const formSchema = z.object({
  studentName: z
    .string()
    .min(2, "Nome do aluno deve ter pelo menos 2 caracteres"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  guardianName: z
    .string()
    .min(2, "Nome do responsável deve ter pelo menos 2 caracteres"),
  guardianPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  service: z.enum(
    [
      "integral",
      "meio-periodo",
      "infantil-vespertino",
      "fundamental-vespertino",
    ],
    {
      message: "Selecione um serviço",
    },
  ),
  grade: z.string().min(1, "Selecione uma série"),
  paymentOption: z.enum(["vista", "parcelado"], {
    message: "Selecione uma opção de pagamento",
  }),
});

type FormData = z.infer<typeof formSchema>;

// Opções de séries por serviço
const gradeOptions = {
  integral: [
    { value: "maternal-3", label: "Maternal (3 anos)" },
    { value: "maternal-4", label: "Maternal (4 anos)" },
    { value: "pre-1", label: "Pré I (4 anos)" },
    { value: "pre-2", label: "Pré II (5 anos)" },
    { value: "1-ano", label: "1º Ano" },
    { value: "2-ano", label: "2º Ano" },
    { value: "3-ano", label: "3º Ano" },
    { value: "4-ano", label: "4º Ano" },
    { value: "5-ano", label: "5º Ano" },
  ],
  "meio-periodo": [
    { value: "maternal-3", label: "Maternal (3 anos)" },
    { value: "maternal-4", label: "Maternal (4 anos)" },
    { value: "pre-1", label: "Pré I (4 anos)" },
    { value: "pre-2", label: "Pré II (5 anos)" },
    { value: "1-ano", label: "1º Ano" },
    { value: "2-ano", label: "2º Ano" },
    { value: "3-ano", label: "3º Ano" },
    { value: "4-ano", label: "4º Ano" },
    { value: "5-ano", label: "5º Ano" },
  ],
  "infantil-vespertino": [
    { value: "maternal-3", label: "Maternal (3 anos)" },
    { value: "maternal-4", label: "Maternal (4 anos)" },
    { value: "pre-1", label: "Pré I (4 anos)" },
    { value: "pre-2", label: "Pré II (5 anos)" },
  ],
  "fundamental-vespertino": [
    { value: "1-ano", label: "1º Ano" },
    { value: "2-ano", label: "2º Ano" },
    { value: "3-ano", label: "3º Ano" },
    { value: "4-ano", label: "4º Ano" },
    { value: "5-ano", label: "5º Ano" },
  ],
};

interface PreEnrollmentFormProps {
  classForm: string;
  classFormP: string;
}

export function PreEnrollmentForm({
  classForm,
  classFormP,
}: PreEnrollmentFormProps) {
  const [open, setOpen] = useState(false);
  // const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      birthDate: "",
      guardianName: "",
      guardianPhone: "",
      service: undefined,
      grade: "",
      paymentOption: undefined,
    },
  });

  const selectedService = form.watch("service");

  // Reset grade when service changes
  const handleServiceChange = (value: string) => {
    form.setValue("service", value as FormData["service"]);
    form.setValue("grade", "");
  };

  const onSubmit = (data: FormData) => {
    console.log("Dados da pré-matrícula:", data);

    // toast({
    //   title: "Pré-matrícula enviada com sucesso!",
    //   description: "Entraremos em contato em breve para finalizar o processo.",
    // });

    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className={cn(`w-full sm:w-auto ${classForm}`)}>
          <p className={cn(`text-[25px] ${classFormP}`)}>
            Iniciar Pré-Matrícula
          </p>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Formulário de Pré-Matrícula</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para iniciar o processo de matrícula.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome do Aluno */}
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Aluno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome completo do aluno"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de Nascimento */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome do Responsável */}
            <FormField
              control={form.control}
              name="guardianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Responsável</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome completo do responsável"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone do Responsável */}
            <FormField
              control={form.control}
              name="guardianPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone do Responsável</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      {...field}
                      onChange={(e) => {
                        // Formatação básica do telefone
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 11) {
                          value = value.replace(
                            /(\d{2})(\d{5})(\d{4})/,
                            "($1) $2-$3",
                          );
                          if (value.length < 14) {
                            value = value.replace(
                              /(\d{2})(\d{4})(\d{4})/,
                              "($1) $2-$3",
                            );
                          }
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Serviço Solicitado */}
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço Solicitado</FormLabel>
                  <Select
                    onValueChange={handleServiceChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="integral">Integral</SelectItem>
                      <SelectItem value="meio-periodo">Meio Período</SelectItem>
                      <SelectItem value="infantil-vespertino">
                        Infantil - Vespertino
                      </SelectItem>
                      <SelectItem value="fundamental-vespertino">
                        Fundamental - Vespertino
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Série (condicional baseada no serviço) */}
            {selectedService && (
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Série</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a série" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeOptions[selectedService]?.map((grade) => (
                          <SelectItem key={grade.value} value={grade.value}>
                            {grade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Opção de Pagamento */}
            <FormField
              control={form.control}
              name="paymentOption"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Opção de Pagamento da Matrícula</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="vista" id="vista" />
                        <label
                          htmlFor="vista"
                          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          À vista em setembro
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="parcelado" id="parcelado" />
                        <label
                          htmlFor="parcelado"
                          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Parcelado (1ª parcela em setembro, 2ª parcela em
                          outubro)
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Enviar Pré-Matrícula
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
